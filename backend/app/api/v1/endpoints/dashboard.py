from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import DashboardService\nfrom app.auth.rbac import require_roles\nfrom app.models.enums import RoleEnum

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(
    current_user: User = Depends(require_roles(RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    return await DashboardService(db).get_summary()
