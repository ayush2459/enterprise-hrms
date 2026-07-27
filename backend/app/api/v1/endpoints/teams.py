from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.team import OrgSnippet, TeamStatusRow
from app.services.team_service import TeamService

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("/{employee_id}/org", response_model=OrgSnippet)
async def get_org_snippet(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await TeamService(db).get_org_snippet(employee_id)
    await db.commit()
    return result


@router.get("/{employee_id}/status-summary", response_model=list[TeamStatusRow])
async def get_status_summary(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await TeamService(db).get_status_summary(employee_id, current_user)
    await db.commit()
    return result
