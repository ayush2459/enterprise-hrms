from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.import_result import EmployeeImportResult
from app.services.employee_import_service import EmployeeImportService

router = APIRouter(prefix="/employees/import", tags=["employees"])


@router.post("", response_model=EmployeeImportResult)
async def import_employees(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bulk-create/update employees from an uploaded .xlsx sheet. HR Admin,
    HR Executive, or System Admin only. See employee_import_service.py's
    HEADER_ALIASES for which column headers are recognized."""
    result = await EmployeeImportService(db).import_from_excel(file, current_user)
    await db.commit()
    return result
