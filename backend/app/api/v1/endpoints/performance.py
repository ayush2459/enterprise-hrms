from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.performance import (
    ManagerAssessmentUpdate,
    PerformanceReviewRead,
    ReviewCycleCreate,
    ReviewCycleRead,
    ReviewCycleStatusUpdate,
    SelfAssessmentUpdate,
)
from app.services.performance_service import PerformanceService

router = APIRouter(prefix="/performance", tags=["performance"])


@router.get("/cycles", response_model=list[ReviewCycleRead])
async def list_cycles(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await PerformanceService(db).list_cycles()


@router.post("/cycles", response_model=ReviewCycleRead, status_code=201)
async def create_cycle(
    payload: ReviewCycleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PerformanceService(db).create_cycle(
        payload.name, payload.start_date, payload.end_date, current_user
    )
    await db.commit()
    return result


@router.patch("/cycles/{cycle_id}/status", response_model=ReviewCycleRead)
async def update_cycle_status(
    cycle_id: UUID,
    payload: ReviewCycleStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PerformanceService(db).update_cycle_status(cycle_id, payload.status, current_user)
    await db.commit()
    return result


@router.get("/employee/{employee_id}", response_model=list[PerformanceReviewRead])
async def list_reviews_for_employee(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await PerformanceService(db).list_for_employee(employee_id, current_user)


@router.post("/cycles/{cycle_id}/employee/{employee_id}", response_model=PerformanceReviewRead, status_code=201)
async def initiate_review(
    cycle_id: UUID,
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PerformanceService(db).initiate_review(cycle_id, employee_id, current_user)
    await db.commit()
    return result


@router.patch("/reviews/{review_id}/self-assessment", response_model=PerformanceReviewRead)
async def submit_self_assessment(
    review_id: UUID,
    payload: SelfAssessmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PerformanceService(db).submit_self_assessment(review_id, payload.self_assessment, current_user)
    await db.commit()
    return result


@router.patch("/reviews/{review_id}/manager-assessment", response_model=PerformanceReviewRead)
async def submit_manager_assessment(
    review_id: UUID,
    payload: ManagerAssessmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PerformanceService(db).submit_manager_assessment(
        review_id, payload.manager_assessment, payload.rating, current_user
    )
    await db.commit()
    return result
