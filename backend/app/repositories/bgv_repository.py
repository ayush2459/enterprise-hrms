from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bgv_check import BGVCheck
from app.models.enums import BGVCheckStatus


class BGVRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, check_id: UUID) -> BGVCheck | None:
        result = await self.db.execute(select(BGVCheck).where(BGVCheck.id == check_id))
        return result.scalar_one_or_none()

    async def list_by_employee(self, employee_id: UUID) -> list[BGVCheck]:
        result = await self.db.execute(
            select(BGVCheck).where(BGVCheck.employee_id == employee_id).order_by(BGVCheck.check_type)
        )
        return list(result.scalars().all())

    async def get_by_employee_and_type(self, employee_id: UUID, check_type: str) -> BGVCheck | None:
        result = await self.db.execute(
            select(BGVCheck).where(
                BGVCheck.employee_id == employee_id, BGVCheck.check_type == check_type
            )
        )
        return result.scalar_one_or_none()

    async def count_pending(self) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(BGVCheck)
            .where(BGVCheck.status.in_([BGVCheckStatus.INITIATED, BGVCheckStatus.IN_PROGRESS]))
        )
        return result.scalar_one()

    async def create(self, check: BGVCheck) -> BGVCheck:
        self.db.add(check)
        await self.db.flush()
        await self.db.refresh(check)
        return check

    async def save(self, check: BGVCheck) -> BGVCheck:
        await self.db.flush()
        await self.db.refresh(check)
        return check
