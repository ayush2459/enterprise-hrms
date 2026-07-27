from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.performance_review import PerformanceReview
from app.models.review_cycle import ReviewCycle


class ReviewCycleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, cycle_id: UUID) -> ReviewCycle | None:
        result = await self.db.execute(select(ReviewCycle).where(ReviewCycle.id == cycle_id))
        return result.scalar_one_or_none()

    async def list_all(self) -> list[ReviewCycle]:
        result = await self.db.execute(select(ReviewCycle).order_by(ReviewCycle.created_at.desc()))
        return list(result.scalars().all())

    async def create(self, cycle: ReviewCycle) -> ReviewCycle:
        self.db.add(cycle)
        await self.db.flush()
        await self.db.refresh(cycle)
        return cycle

    async def save(self, cycle: ReviewCycle) -> ReviewCycle:
        await self.db.flush()
        await self.db.refresh(cycle)
        return cycle


class PerformanceReviewRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, review_id: UUID) -> PerformanceReview | None:
        result = await self.db.execute(select(PerformanceReview).where(PerformanceReview.id == review_id))
        return result.scalar_one_or_none()

    async def get_by_cycle_and_employee(self, cycle_id: UUID, employee_id: UUID) -> PerformanceReview | None:
        result = await self.db.execute(
            select(PerformanceReview).where(
                PerformanceReview.review_cycle_id == cycle_id,
                PerformanceReview.employee_id == employee_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_cycle(self, cycle_id: UUID) -> list[PerformanceReview]:
        result = await self.db.execute(
            select(PerformanceReview).where(PerformanceReview.review_cycle_id == cycle_id)
        )
        return list(result.scalars().all())

    async def list_by_employee(self, employee_id: UUID) -> list[PerformanceReview]:
        result = await self.db.execute(
            select(PerformanceReview).where(PerformanceReview.employee_id == employee_id)
        )
        return list(result.scalars().all())

    async def create(self, review: PerformanceReview) -> PerformanceReview:
        self.db.add(review)
        await self.db.flush()
        await self.db.refresh(review)
        return review

    async def save(self, review: PerformanceReview) -> PerformanceReview:
        await self.db.flush()
        await self.db.refresh(review)
        return review
