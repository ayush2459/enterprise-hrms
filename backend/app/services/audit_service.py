from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


class AuditService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def log(
        self,
        user_id: UUID | None,
        action: str,
        resource_type: str | None = None,
        resource_id: str | None = None,
        detail: str | None = None,
        ip: str | None = None,
        ua: str | None = None,
    ) -> None:
        entry = AuditLog(
            user_id=user_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            detail=detail,
            ip_address=ip,
            user_agent=ua,
        )
        self.db.add(entry)
        await self.db.flush()
