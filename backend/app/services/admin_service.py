"""
'Clear all data & start fresh' — a System-Admin-only tool that backs the
entire database up to a JSON file on disk, then wipes every table except
the caller's own login (so the admin isn't locked out of the system they
just reset).

This is deliberately gated behind require_roles(SYSTEM_ADMIN) at the
endpoint level, plus a re-typed password and a literal "RESET"
confirmation phrase in the request body — there's no undo once this
runs beyond restoring from the backup file it writes first.
"""
import json
import uuid
from datetime import date, datetime
from pathlib import Path

from fastapi import HTTPException, status
from sqlalchemy import delete, select, text
from sqlalchemy.ext.asyncio import AsyncSession

import app.models  # noqa: F401  (registers every model on Base.metadata)
from app.core.config import settings
from app.core.security import verify_password
from app.db.base import Base
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.admin import BackupInfo, DataResetResponse
from app.services.audit_service import AuditService

# Never truncated by the reset — this is what keeps the calling admin
# able to log back in immediately afterwards. Their row is kept; every
# other user's row is deleted (not truncated, so the CASCADE from other
# tables can't take it out from under us).
PRESERVED_TABLE = "users"
IGNORED_TABLES = {"alembic_version"}


def _json_default(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, uuid.UUID):
        return str(value)
    return str(value)


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)
        self.audit = AuditService(db)

    def _backup_dir(self) -> Path:
        path = Path(settings.BACKUP_ROOT)
        path.mkdir(parents=True, exist_ok=True)
        return path

    async def _write_backup(self) -> str:
        """Dumps every row of every table to a single timestamped JSON
        file before anything is deleted."""
        dump: dict[str, list[dict]] = {}
        for table in Base.metadata.sorted_tables:
            if table.name in IGNORED_TABLES:
                continue
            result = await self.db.execute(select(table))
            rows = [dict(row._mapping) for row in result.fetchall()]
            dump[table.name] = rows

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"hrms_backup_{timestamp}.json"
        dest = self._backup_dir() / filename
        with open(dest, "w") as f:
            json.dump(dump, f, default=_json_default, indent=2)
        return filename

    async def reset_all_data(self, requester: User, password: str) -> DataResetResponse:
        if not verify_password(password, requester.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Password is incorrect."
            )

        backup_filename = await self._write_backup()

        # Truncate every table except users, letting CASCADE follow the
        # FK graph so ordering doesn't matter. Then remove every user row
        # except the caller's own, so they can still log in afterwards.
        cleared: list[str] = []
        for table in Base.metadata.sorted_tables:
            if table.name in IGNORED_TABLES or table.name == PRESERVED_TABLE:
                continue
            await self.db.execute(text(f'TRUNCATE TABLE "{table.name}" RESTART IDENTITY CASCADE'))
            cleared.append(table.name)

        result = await self.db.execute(delete(User).where(User.id != requester.id))
        users_removed = result.rowcount or 0

        # The audit_log table was just truncated along with everything
        # else, so this is genuinely the first entry in the fresh system —
        # a record that a reset happened, and by whom.
        await self.audit.log(
            requester.id,
            "system_data_reset",
            detail=f"backup={backup_filename}, tables_cleared={len(cleared)}, users_removed={users_removed}",
        )

        return DataResetResponse(
            backup_filename=backup_filename,
            tables_cleared=cleared,
            users_removed=users_removed,
            message=(
                "All company data has been cleared and a backup was saved on the server. "
                "Your own login was kept so you can start setting things up again."
            ),
        )

    def list_backups(self) -> list[BackupInfo]:
        backups = []
        for path in sorted(self._backup_dir().glob("hrms_backup_*.json"), reverse=True):
            stat = path.stat()
            backups.append(
                BackupInfo(
                    filename=path.name,
                    size_bytes=stat.st_size,
                    created_at=datetime.fromtimestamp(stat.st_mtime),
                )
            )
        return backups

    def get_backup_path(self, filename: str) -> Path:
        # Guard against path traversal — only a bare filename matching our
        # own naming pattern is ever accepted.
        safe_name = Path(filename).name
        if not safe_name.startswith("hrms_backup_") or not safe_name.endswith(".json"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid backup filename.")
        path = self._backup_dir() / safe_name
        if not path.exists():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup not found.")
        return path
