from datetime import date
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import LeaveRequestStatus
from app.models.leave_request import LeaveRequest
from app.models.leave_type import LeaveType


class LeaveTypeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, leave_type_id: UUID) -> LeaveType | None:
        result = await self.db.execute(select(LeaveType).where(LeaveType.id == leave_type_id))
        return result.scalar_one_or_none()

    async def list_all(self) -> list[LeaveType]:
        result = await self.db.execute(select(LeaveType).order_by(LeaveType.name))
        return list(result.scalars().all())

    async def create(self, leave_type: LeaveType) -> LeaveType:
        self.db.add(leave_type)
        await self.db.flush()
        await self.db.refresh(leave_type)
        return leave_type

    async def update(self, leave_type: LeaveType) -> LeaveType:
        await self.db.flush()
        await self.db.refresh(leave_type)
        return leave_type


class LeaveRequestRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, request_id: UUID) -> LeaveRequest | None:
        result = await self.db.execute(select(LeaveRequest).where(LeaveRequest.id == request_id))
        return result.scalar_one_or_none()

    async def list_by_employee(self, employee_id: UUID) -> list[LeaveRequest]:
        result = await self.db.execute(
            select(LeaveRequest)
            .where(LeaveRequest.employee_id == employee_id)
            .order_by(LeaveRequest.start_date.desc())
        )
        return list(result.scalars().all())

    async def list_approved_by_employee_and_type(self, employee_id: UUID, leave_type_id: UUID) -> list[LeaveRequest]:
        result = await self.db.execute(
            select(LeaveRequest).where(
                LeaveRequest.employee_id == employee_id,
                LeaveRequest.leave_type_id == leave_type_id,
                LeaveRequest.status == LeaveRequestStatus.APPROVED,
            )
        )
        return list(result.scalars().all())

    async def create(self, request: LeaveRequest) -> LeaveRequest:
        self.db.add(request)
        await self.db.flush()
        await self.db.refresh(request)
        return request

    async def save(self, request: LeaveRequest) -> LeaveRequest:
        await self.db.flush()
        await self.db.refresh(request)
        return request

    async def count_pending(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(LeaveRequest).where(LeaveRequest.status == LeaveRequestStatus.PENDING)
        )
        return result.scalar_one()

    async def count_active_today(self) -> int:
        today = date.today()
        result = await self.db.execute(
            select(func.count())
            .select_from(LeaveRequest)
            .where(
                LeaveRequest.status == LeaveRequestStatus.APPROVED,
                LeaveRequest.start_date <= today,
                LeaveRequest.end_date >= today,
            )
        )
        return result.scalar_one()
