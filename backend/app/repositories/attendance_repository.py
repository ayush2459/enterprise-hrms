from datetime import date
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance_record import AttendanceRecord


class AttendanceRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_employee_and_date(self, employee_id: UUID, day: date) -> AttendanceRecord | None:
        result = await self.db.execute(
            select(AttendanceRecord).where(
                AttendanceRecord.employee_id == employee_id, AttendanceRecord.date == day
            )
        )
        return result.scalar_one_or_none()

    async def list_by_employee(self, employee_id: UUID, limit: int = 60) -> list[AttendanceRecord]:
        result = await self.db.execute(
            select(AttendanceRecord)
            .where(AttendanceRecord.employee_id == employee_id)
            .order_by(AttendanceRecord.date.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, record: AttendanceRecord) -> AttendanceRecord:
        self.db.add(record)
        await self.db.flush()
        await self.db.refresh(record)
        return record

    async def save(self, record: AttendanceRecord) -> AttendanceRecord:
        await self.db.flush()
        await self.db.refresh(record)
        return record
