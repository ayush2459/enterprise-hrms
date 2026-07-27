from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attendance_record import AttendanceRecord
from app.models.enums import AttendanceStatus, RoleEnum
from app.models.user import User
from app.repositories.attendance_repository import AttendanceRepository
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.attendance import AttendanceSummary
from app.services.audit_service import AuditService

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class AttendanceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.records = AttendanceRepository(db)
        self.employees = EmployeeRepository(db)
        self.audit = AuditService(db)

    async def _assert_view_access(self, employee_id: UUID, requester: User) -> None:
        if requester.role in HR_ROLES:
            return
        employee = await self.employees.get_by_id(employee_id)
        requester_employee = await self.employees.get_by_user_id(requester.id)
        is_self = employee is not None and employee.user_id == requester.id
        is_manager = (
            requester_employee is not None
            and employee is not None
            and employee.reporting_manager_id == requester_employee.id
        )
        if not (is_self or is_manager):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    async def list_for_employee(self, employee_id: UUID, requester: User) -> list[AttendanceRecord]:
        await self._assert_view_access(employee_id, requester)
        return await self.records.list_by_employee(employee_id)

    async def get_summary(self, employee_id: UUID, requester: User) -> AttendanceSummary:
        await self._assert_view_access(employee_id, requester)
        records = await self.records.list_by_employee(employee_id, limit=365)
        counts = {s.value: 0 for s in AttendanceStatus}
        for r in records:
            counts[r.status.value] += 1
        return AttendanceSummary(
            present=counts["present"],
            absent=counts["absent"],
            half_day=counts["half_day"],
            on_leave=counts["on_leave"],
            holiday=counts["holiday"],
        )

    async def mark(self, employee_id: UUID, day: date, new_status: AttendanceStatus, requester: User) -> AttendanceRecord:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can mark attendance.",
            )
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        existing = await self.records.get_by_employee_and_date(employee_id, day)
        if existing:
            existing.status = new_status
            existing.marked_by = requester.id
            await self.records.save(existing)
            return existing

        record = AttendanceRecord(employee_id=employee_id, date=day, status=new_status, marked_by=requester.id)
        await self.records.create(record)
        await self.audit.log(requester.id, "attendance_mark", "employee", str(employee_id))
        return record
