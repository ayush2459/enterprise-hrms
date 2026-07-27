from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import LeaveRequestStatus, RoleEnum
from app.models.leave_request import LeaveRequest
from app.models.leave_type import LeaveType
from app.models.user import User
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.leave_repository import LeaveRequestRepository, LeaveTypeRepository
from app.schemas.leave import LeaveBalance
from app.services.audit_service import AuditService

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


def _days_between(start, end) -> int:
    return (end - start).days + 1


class LeaveService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.leave_types = LeaveTypeRepository(db)
        self.requests = LeaveRequestRepository(db)
        self.employees = EmployeeRepository(db)
        self.audit = AuditService(db)

    # ---- Leave types (HR only to create; everyone can list) ----
    async def list_leave_types(self) -> list[LeaveType]:
        return await self.leave_types.list_all()

    async def create_leave_type(self, name: str, annual_quota_days: int, requester: User) -> LeaveType:
        if requester.role not in HR_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR only.")
        leave_type = LeaveType(name=name, annual_quota_days=annual_quota_days)
        await self.leave_types.create(leave_type)
        return leave_type

    # ---- Access ----
    async def _assert_view_access(self, employee_id, requester: User) -> None:
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

    # ---- Requests ----
    async def list_for_employee(self, employee_id: UUID, requester: User) -> list[LeaveRequest]:
        await self._assert_view_access(employee_id, requester)
        return await self.requests.list_by_employee(employee_id)

    async def apply(
        self, employee_id: UUID, leave_type_id: UUID, start_date, end_date, reason: str | None, requester: User
    ) -> LeaveRequest:
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        is_self = employee.user_id == requester.id
        if not is_self and requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only apply for leave on your own behalf.",
            )
        if end_date < start_date:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="End date must be on or after start date.")

        request = LeaveRequest(
            employee_id=employee_id,
            leave_type_id=leave_type_id,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
        )
        await self.requests.create(request)
        await self.audit.log(requester.id, "leave_apply", "employee", str(employee_id))
        return request

    async def decide(self, request_id: UUID, new_status: LeaveRequestStatus, requester: User) -> LeaveRequest:
        request = await self.requests.get_by_id(request_id)
        if request is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leave request not found")

        if requester.role not in HR_ROLES:
            employee = await self.employees.get_by_id(request.employee_id)
            requester_employee = await self.employees.get_by_user_id(requester.id)
            is_manager = (
                requester_employee is not None
                and employee is not None
                and employee.reporting_manager_id == requester_employee.id
            )
            if not is_manager:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only this employee's manager or HR can approve/reject leave.",
                )

        request.status = new_status
        request.reviewed_by = requester.id
        await self.requests.save(request)
        await self.audit.log(requester.id, f"leave_{new_status.value}", "leave_request", str(request_id))
        return request

    async def get_balances(self, employee_id: UUID, requester: User) -> list[LeaveBalance]:
        await self._assert_view_access(employee_id, requester)
        leave_types = await self.leave_types.list_all()
        balances = []
        for lt in leave_types:
            approved = await self.requests.list_approved_by_employee_and_type(employee_id, lt.id)
            days_used = sum(_days_between(r.start_date, r.end_date) for r in approved)
            balances.append(
                LeaveBalance(
                    leave_type_id=lt.id,
                    leave_type_name=lt.name,
                    annual_quota_days=lt.annual_quota_days,
                    days_used=days_used,
                    days_remaining=max(lt.annual_quota_days - days_used, 0),
                )
            )
        return balances
