"""
Employee business logic, including the field-level visibility rule from
Section 3: only HR Admin, HR Executive, and the employee themself see
sensitive fields (blood group, personal address, emergency contact).
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.employee import Employee
from app.models.enums import RoleEnum
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

    async def list_directory(self, skip: int, limit: int) -> list[EmployeeReadPublic]:
        employees = await self.repo.list_all(skip, limit)
        return [EmployeeReadPublic.model_validate(e) for e in employees]

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
            # Employees may only edit their own contact-type fields, not
            # org fields like department/designation/manager.
            allowed = {"personal_address", "emergency_contact", "personal_email"}
            data = {k: v for k, v in data.items() if k in allowed}

        for field, value in data.items():
            setattr(employee, field, value)

        await self.repo.save(employee)
        await self.audit.log(requester.id, "employee_update", "employee", str(employee.id))
        return employee
