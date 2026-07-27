from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate


class CandidateRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, candidate_id: UUID) -> Candidate | None:
        result = await self.db.execute(select(Candidate).where(Candidate.id == candidate_id))
        return result.scalar_one_or_none()

    async def list_by_opening(self, job_opening_id: UUID) -> list[Candidate]:
        result = await self.db.execute(
            select(Candidate)
            .where(Candidate.job_opening_id == job_opening_id)
            .order_by(Candidate.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, candidate: Candidate) -> Candidate:
        self.db.add(candidate)
        await self.db.flush()
        await self.db.refresh(candidate)
        return candidate

    async def save(self, candidate: Candidate) -> Candidate:
        await self.db.flush()
        await self.db.refresh(candidate)
        return candidate
