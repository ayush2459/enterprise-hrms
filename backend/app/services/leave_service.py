from datetime import date
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


def _days_in_year(start, end, year: int) -> int:
    """Return only the portion of a date range that falls inside a calendar year."""
    year_start = date(year, 1, 1)
    year_end = date(year, 12, 31)

    overlap_start = max(start, year_start)
    overlap_end = min(end, year_end)

    if overlap_end < overlap_start:
        return 0

    return _days_between(overlap_start, overlap_end)


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

    async def create_leave_type(
        self,
        name: str,
        annual_quota_days: int,
        eligibility_gender: str,
        is_paid: bool,
        carry_forward_allowed: bool,
        max_carry_forward_days: int,
        encashment_allowed: bool,
        requires_document: bool,
        requires_reason: bool,
        min_days: int,
        max_days: int,
        advance_notice_days: int,
        is_active: bool,
        requester: User,
    ) -> LeaveType:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="HR only.",
            )

        if eligibility_gender not in {"all", "male", "female"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid gender eligibility.",
            )

        if annual_quota_days < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Annual quota cannot be negative.",
            )

        if min_days < 1 or max_days < min_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid minimum/maximum leave duration.",
            )

        if max_carry_forward_days < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum carry-forward days cannot be negative.",
            )

        if not carry_forward_allowed:
            max_carry_forward_days = 0

        leave_type = LeaveType(
            name=name.strip(),
            annual_quota_days=annual_quota_days,
            eligibility_gender=eligibility_gender,
            is_paid=is_paid,
            carry_forward_allowed=carry_forward_allowed,
            max_carry_forward_days=max_carry_forward_days,
            encashment_allowed=encashment_allowed,
            requires_document=requires_document,
            requires_reason=requires_reason,
            min_days=min_days,
            max_days=max_days,
            advance_notice_days=advance_notice_days,
            is_active=is_active,
        )

        await self.leave_types.create(leave_type)
        return leave_type

    async def update_leave_type(
        self,
        leave_type_id: UUID,
        payload,
        requester: User,
    ) -> LeaveType:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="HR only.",
            )

        leave_type = await self.leave_types.get_by_id(leave_type_id)

        if leave_type is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leave type not found.",
            )

        if payload.eligibility_gender not in {"all", "male", "female"}:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid gender eligibility.",
            )

        if payload.annual_quota_days < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Annual quota cannot be negative.",
            )

        if payload.min_days < 1 or payload.max_days < payload.min_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid minimum/maximum leave duration.",
            )

        if payload.max_carry_forward_days < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum carry-forward days cannot be negative.",
            )

        leave_type.name = payload.name.strip()
        leave_type.annual_quota_days = payload.annual_quota_days
        leave_type.eligibility_gender = payload.eligibility_gender
        leave_type.is_paid = payload.is_paid
        leave_type.carry_forward_allowed = payload.carry_forward_allowed
        leave_type.max_carry_forward_days = (
            payload.max_carry_forward_days
            if payload.carry_forward_allowed
            else 0
        )
        leave_type.encashment_allowed = payload.encashment_allowed
        leave_type.requires_document = payload.requires_document
        leave_type.requires_reason = payload.requires_reason
        leave_type.min_days = payload.min_days
        leave_type.max_days = payload.max_days
        leave_type.advance_notice_days = payload.advance_notice_days
        leave_type.is_active = payload.is_active

        return await self.leave_types.update(leave_type)

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
        self,
        employee_id: UUID,
        leave_type_id: UUID,
        start_date,
        end_date,
        reason: str | None,
        requester: User,
    ) -> LeaveRequest:
        employee = await self.employees.get_by_id(employee_id)

        if employee is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employee not found",
            )

        is_self = employee.user_id == requester.id

        if not is_self and requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only apply for leave on your own behalf.",
            )

        leave_type = await self.leave_types.get_by_id(leave_type_id)

        if leave_type is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Leave type not found.",
            )

        # ---------------------------------------------------------
        # POLICY STATUS
        # ---------------------------------------------------------
        if not leave_type.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{leave_type.name} is currently inactive.",
            )

        # ---------------------------------------------------------
        # DATE VALIDATION
        # ---------------------------------------------------------
        if end_date < start_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="End date must be on or after start date.",
            )

        requested_days = _days_between(start_date, end_date)

        # ---------------------------------------------------------
        # GENDER ELIGIBILITY
        # ---------------------------------------------------------
        eligibility = (leave_type.eligibility_gender or "all").lower()

        if eligibility != "all":
            employee_gender = (employee.gender or "").strip().lower()

            gender_map = {
                "m": "male",
                "man": "male",
                "men": "male",
                "male": "male",
                "f": "female",
                "woman": "female",
                "women": "female",
                "female": "female",
            }

            normalized_gender = gender_map.get(employee_gender)

            if normalized_gender is None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        f"{leave_type.name} is restricted to "
                        f"{eligibility} employees, but this employee "
                        "does not have a matching gender eligibility."
                    ),
                )

            if normalized_gender != eligibility:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=(
                        f"{leave_type.name} is only available to "
                        f"{eligibility} employees."
                    ),
                )

        # ---------------------------------------------------------
        # MIN / MAX DURATION
        # ---------------------------------------------------------
        if requested_days < leave_type.min_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"{leave_type.name} requires at least "
                    f"{leave_type.min_days} day(s)."
                ),
            )

        if requested_days > leave_type.max_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"{leave_type.name} allows a maximum of "
                    f"{leave_type.max_days} day(s) per request."
                ),
            )

        # ---------------------------------------------------------
        # ADVANCE NOTICE
        # ---------------------------------------------------------
        if leave_type.advance_notice_days > 0:
            notice_days = (start_date - date.today()).days

            if notice_days < leave_type.advance_notice_days:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"{leave_type.name} requires at least "
                        f"{leave_type.advance_notice_days} day(s) "
                        "advance notice."
                    ),
                )

        # ---------------------------------------------------------
        # REASON
        # ---------------------------------------------------------
        if leave_type.requires_reason and not (reason or "").strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"A reason is required when applying for "
                    f"{leave_type.name}."
                ),
            )

        # ---------------------------------------------------------
        # ANNUAL BALANCE + CARRY FORWARD
        # ---------------------------------------------------------
        current_year = start_date.year
        previous_year = current_year - 1

        approved = await self.requests.list_approved_by_employee_and_type(
            employee_id,
            leave_type.id,
        )

        # Only approved leave taken in the current calendar year
        # consumes the current year's quota.
        current_year_used = sum(
            _days_in_year(
                request.start_date,
                request.end_date,
                current_year,
            )
            for request in approved
        )

        # Calculate unused quota from the previous calendar year.
        previous_year_used = sum(
            _days_in_year(
                request.start_date,
                request.end_date,
                previous_year,
            )
            for request in approved
        )

        previous_year_unused = max(
            leave_type.annual_quota_days - previous_year_used,
            0,
        )

        # Carry-forward is controlled entirely by the policy
        # configured by HR/admin.
        carry_forward_days = 0

        if leave_type.carry_forward_allowed:
            carry_forward_days = min(
                previous_year_unused,
                leave_type.max_carry_forward_days,
            )

        total_available_days = (
            leave_type.annual_quota_days
            + carry_forward_days
        )

        remaining_days = max(
            total_available_days - current_year_used,
            0,
        )

        if requested_days > remaining_days:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient {leave_type.name} balance. "
                    f"{remaining_days} day(s) remaining."
                ),
            )

        # ---------------------------------------------------------
        # CREATE REQUEST
        # ---------------------------------------------------------
        request = LeaveRequest(
            employee_id=employee_id,
            leave_type_id=leave_type_id,
            start_date=start_date,
            end_date=end_date,
            reason=reason.strip() if reason else None,
        )

        await self.requests.create(request)

        await self.audit.log(
            requester.id,
            "leave_apply",
            "employee",
            str(employee_id),
        )

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
