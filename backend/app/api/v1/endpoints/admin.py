from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.rbac import require_roles
from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.user import User
from app.schemas.admin import BackupInfo, DataResetRequest, DataResetResponse
from app.services.admin_service import AdminService

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_roles(RoleEnum.SYSTEM_ADMIN))],
)


@router.post("/data-reset", response_model=DataResetResponse)
async def reset_all_data(
    payload: DataResetRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Backs up every table to disk, then clears all company data. Keeps
    only the calling System Admin's own login so they aren't locked out."""
    result = await AdminService(db).reset_all_data(current_user, payload.password)
    await db.commit()
    return result


@router.get("/backups", response_model=list[BackupInfo])
async def list_backups(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return AdminService(db).list_backups()


@router.get("/backups/{filename}/download")
async def download_backup(
    filename: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    path = AdminService(db).get_backup_path(filename)
    return FileResponse(path=path, filename=path.name, media_type="application/json")
