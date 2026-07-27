from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.onboarding import OnboardingStatus
from app.services.onboarding_service import OnboardingService

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("", response_model=list[OnboardingStatus])
async def list_onboarding(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await OnboardingService(db).list_in_progress(current_user)


@router.post("/{employee_id}/complete", status_code=204)
async def complete_onboarding(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await OnboardingService(db).mark_complete(employee_id, current_user)
    await db.commit()
