"""
Employee business logic, including the field-level visibility rule from
Section 3: only HR Admin, HR Executive, and the employee themself see
sensitive fields (blood group, personal address, emergency contact).
"""
from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.employee import Employee
from app.models.enums import ConversionStatus, EmployeeStatus, EmploymentType, OffboardReason, RoleEnum
from app.models.user import User
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.user_repository import UserRepository
from app.schemas.employee import (
    EmployeeCreateRequest,
    EmployeeCreateResponse,
    EmployeeReadFull,
    EmployeeReadPublic,
    EmployeeStats,
    EmployeeUpdate,
    OffboardedEmployee,
)
from app.services.audit_service import AuditService
from app.utils.password_generator import generate_temp_password

FULL_ACCESS_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class EmployeeService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = EmployeeRepository(db)
        self.users = UserRepository(db)
        self.audit = AuditService(db)

    async def get_visible_profile(
        self, employee: Employee, requester: User
    ) -> EmployeeReadFull | EmployeeReadPublic:
        is_self = employee.user_id == requester.id
        is_privileged = requester.role in FULL_ACCESS_ROLES

        if is_self or is_privileged:
            await self.audit.log(
                requester.id, "employee_view_full", "employee", str(employee.id)
            )
            return EmployeeReadFull.model_validate(employee)

        await self.audit.log(requester.id, "employee_view_public", "employee", str(employee.id))
        return EmployeeReadPublic.model_validate(employee)

    async def list_directory(
        self, skip: int, limit: int, include_separated: bool = False
    ) -> list[EmployeeReadPublic]:
        employees = await self.repo.list_all(skip, limit, include_separated=include_separated)
        return [EmployeeReadPublic.model_validate(e) for e in employees]

    async def list_offboarded(
        self, skip: int = 0, limit: int = 50
    ) -> list["OffboardedEmployee"]:
        employees = await self.repo.list_offboarded(limit)
        return [
            OffboardedEmployee(
                id=e.id,
                full_name=e.full_name,
                designation=e.designation,
                department=e.department,
                status=e.status,
                offboarded_at=e.offboarded_at,
                offboard_reason=e.offboard_reason.value if e.offboard_reason else None,
            )
            for e in employees[skip:]
        ]

    async def get_stats(self) -> EmployeeStats:
        total = await self.repo.count_total()
        active_today = await self.repo.count_active_today()
        return EmployeeStats(total_employees=total, active_today=active_today)

    async def create_employee(
        self, payload: EmployeeCreateRequest, requester: User
    ) -> EmployeeCreateResponse:
        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can add employees.",
            )

        existing = await self.users.get_by_email(payload.official_email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this official email already exists.",
            )

        temp_password = generate_temp_password()
        user = User(
            official_email=payload.official_email,
            employee_id=payload.employee_id,
            hashed_password=hash_password(temp_password),
            role=RoleEnum.EMPLOYEE,
            is_active=True,
        )
        await self.users.create(user)

        employee = Employee(
            user_id=user.id,
            full_name=payload.full_name,
            department=payload.department,
            designation=payload.designation,
            employment_type=payload.employment_type,
            date_of_joining=payload.date_of_joining,
            reporting_manager_id=payload.reporting_manager_id,
            notice_period_days=payload.notice_period_days,
        )
        await self.repo.create(employee)

        await self.audit.log(requester.id, "employee_create", "employee", str(employee.id))

        return EmployeeCreateResponse(
            id=employee.id,
            full_name=employee.full_name,
            official_email=user.official_email,
            temporary_password=temp_password,
        )

    async def update_employee(
        self, employee: Employee, payload: EmployeeUpdate, requester: User
    ) -> Employee:
        is_self = employee.user_id == requester.id
        is_privileged = requester.role in FULL_ACCESS_ROLES

        data = payload.model_dump(exclude_unset=True)
        if not is_privileged and not is_self:
            data = {}  # no write access at all
        elif not is_privileged and is_self:
            # Employees may only edit their own contact/banking-type fields,
            # not org fields like department/designation/manager.
            allowed = {
                "personal_address",
                "emergency_contact",
                "personal_email",
                "mobile_number",
                "bank_account_number",
                "bank_ifsc",
                "bank_name",
                "pf_number",
            }
            data = {k: v for k, v in data.items() if k in allowed}

        for field, value in data.items():
            setattr(employee, field, value)

        await self.repo.save(employee)
        await self.audit.log(requester.id, "employee_update", "employee", str(employee.id))
        return employee

    async def request_conversion(self, employee: Employee, requester: User) -> Employee:
        """An intern (or HR, on their behalf) asks to be converted to a
        full-time employee. Puts the request in front of the reporting
        manager / HR for a decision — see decide_conversion below."""
        if employee.employment_type != EmploymentType.INTERN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only interns can request conversion to full-time.",
            )

        is_self = employee.user_id == requester.id
        is_privileged = requester.role in FULL_ACCESS_ROLES
        if not (is_self or is_privileged):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only the intern themselves, HR, or System Admin can request conversion.",
            )

        if employee.conversion_status == ConversionStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A conversion request is already pending for this employee.",
            )

        employee.conversion_status = ConversionStatus.PENDING
        await self.repo.save(employee)
        await self.audit.log(requester.id, "employee_conversion_request", "employee", str(employee.id))
        return employee

    async def decide_conversion(self, employee: Employee, approve: bool, requester: User) -> Employee:
        """'Team approval' — the reporting manager (or HR/System Admin)
        approves or rejects a pending conversion request. Approval flips
        employment_type from intern to full_time immediately."""
        is_privileged = requester.role in FULL_ACCESS_ROLES
        is_manager = False
        if not is_privileged:
            requester_employee = await self.repo.get_by_user_id(requester.id)
            is_manager = (
                requester_employee is not None
                and employee.reporting_manager_id == requester_employee.id
            )

        if not (is_privileged or is_manager):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only this employee's reporting manager, HR Admin, HR Executive, "
                    "or System Admin can decide on a conversion request."
                ),
            )

        if employee.conversion_status != ConversionStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="There is no pending conversion request for this employee.",
            )

        if approve:
            employee.employment_type = EmploymentType.FULL_TIME
            employee.conversion_status = ConversionStatus.APPROVED
        else:
            employee.conversion_status = ConversionStatus.REJECTED

        await self.repo.save(employee)
        await self.audit.log(
            requester.id,
            "employee_conversion_decide",
            "employee",
            str(employee.id),
            detail="approved" if approve else "rejected",
        )
        return employee

    async def offboard_employee(
        self,
        employee: Employee,
        reason: OffboardReason,
        requester: User,
    ) -> Employee:
        """Move an employee into the canonical OFFBOARDED state."""

        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only HR Admin, HR Executive, or System Admin "
                    "can offboard an employee."
                ),
            )

        if employee.status == EmployeeStatus.OFFBOARDED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This employee has already been offboarded.",
            )

        employee.status = EmployeeStatus.OFFBOARDED

        # Map API reasons ("resigned"/"terminated") to the PostgreSQL
        # offboard_reason_enum values ("RESIGNATION"/"TERMINATION").
        if isinstance(reason, str):
            reason_value = reason.lower()
        else:
            reason_value = reason.value.lower()

        reason_map = {
            "resigned": OffboardReason.RESIGNATION,
            "resignation": OffboardReason.RESIGNATION,
            "terminated": OffboardReason.TERMINATION,
            "termination": OffboardReason.TERMINATION,
            "contract_end": OffboardReason.CONTRACT_END,
            "retirement": OffboardReason.RETIREMENT,
            "abandonment": OffboardReason.ABANDONMENT,
            "other": OffboardReason.OTHER,
        }

        mapped_reason = reason_map.get(reason_value)

        if mapped_reason is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported offboarding reason: {reason_value}",
            )

        employee.offboard_reason = mapped_reason
        employee.offboarded_at = date.today()

        # Remove manager relationships from direct reports.
        reports = await self.repo.list_direct_reports(employee.id)

        for report in reports:
            report.reporting_manager_id = None

        # Disable the employee's login.
        employee_user = await self.users.get_by_id(employee.user_id)
        if employee_user is not None:
            employee_user.is_active = False

        await self.repo.save(employee)

        await self.audit.log(
            requester.id,
            "employee_offboard",
            "employee",
            str(employee.id),
            detail=reason.value,
        )

        return employee

    async def reactivate_employee(
        self,
        employee: Employee,
        requester: User,
    ) -> Employee:
        """Restore an offboarded employee to the active roster."""

        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Only HR Admin, HR Executive, or System Admin "
                    "can reactivate an employee."
                ),
            )

        if employee.status != EmployeeStatus.OFFBOARDED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This employee is not offboarded.",
            )

        employee.status = EmployeeStatus.ACTIVE
        employee.offboard_reason = None
        employee.offboarded_at = None

        employee_user = await self.users.get_by_id(employee.user_id)
        if employee_user is not None:
            employee_user.is_active = True

        await self.repo.save(employee)

        await self.audit.log(
            requester.id,
            "employee_reactivate",
            "employee",
            str(employee.id),
        )

        return employee
