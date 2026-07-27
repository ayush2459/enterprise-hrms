from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.payroll_record import PayrollRecord


class PayrollRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, record_id: UUID) -> PayrollRecord | None:
        result = await self.db.execute(select(PayrollRecord).where(PayrollRecord.id == record_id))
        return result.scalar_one_or_none()

    async def list_by_employee(self, employee_id: UUID) -> list[PayrollRecord]:
        result = await self.db.execute(
            select(PayrollRecord)
            .where(PayrollRecord.employee_id == employee_id)
            .order_by(PayrollRecord.month.desc())
        )
        return list(result.scalars().all())

    async def get_by_employee_and_month(self, employee_id: UUID, month) -> PayrollRecord | None:
        result = await self.db.execute(
            select(PayrollRecord).where(
                PayrollRecord.employee_id == employee_id, PayrollRecord.month == month
            )
        )
        return result.scalar_one_or_none()

    async def create(self, record: PayrollRecord) -> PayrollRecord:
        self.db.add(record)
        await self.db.flush()
        await self.db.refresh(record)
        return record

    async def save(self, record: PayrollRecord) -> PayrollRecord:
        await self.db.flush()
        await self.db.refresh(record)
        return record
