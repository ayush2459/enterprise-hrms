from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.job_opening import JobOpening


class JobOpeningRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, opening_id: UUID) -> JobOpening | None:
        result = await self.db.execute(select(JobOpening).where(JobOpening.id == opening_id))
        return result.scalar_one_or_none()

    async def list_all(self) -> list[JobOpening]:
        result = await self.db.execute(select(JobOpening).order_by(JobOpening.created_at.desc()))
        return list(result.scalars().all())

    async def create(self, opening: JobOpening) -> JobOpening:
        self.db.add(opening)
        await self.db.flush()
        await self.db.refresh(opening)
        return opening

    async def save(self, opening: JobOpening) -> JobOpening:
        await self.db.flush()
        await self.db.refresh(opening)
        return opening
