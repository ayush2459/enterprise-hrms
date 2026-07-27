"""
Background verification check management. Only HR roles initiate or
update checks; employees and managers can view status but never see the
HR-only notes field (Section 3, Section 5.3).
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bgv_check import BGVCheck
from app.models.enums import BGVCheckStatus, RoleEnum
from app.models.user import User
from app.repositories.bgv_repository import BGVRepository
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.bgv import CHECK_TYPES
from app.services.audit_service import AuditService

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class BGVService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = BGVRepository(db)
        self.employees = EmployeeRepository(db)
        self.audit = AuditService(db)

    async def list_for_employee(self, employee_id: UUID, requester: User) -> list[BGVCheck]:
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        is_self = employee.user_id == requester.id
        if not is_self and requester.role not in HR_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

        return await self.repo.list_by_employee(employee_id)

    async def initiate(self, employee_id: UUID, check_type: str, requester: User) -> BGVCheck:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can initiate BGV checks.",
            )
        if check_type not in CHECK_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"check_type must be one of {CHECK_TYPES}",
            )
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        existing = await self.repo.get_by_employee_and_type(employee_id, check_type)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A '{check_type}' check already exists for this employee.",
            )

        check = BGVCheck(employee_id=employee_id, check_type=check_type, updated_by=requester.id)
        await self.repo.create(check)
        await self.audit.log(requester.id, "bgv_initiate", "bgv_check", str(check.id), detail=check_type)
        return check

    async def update_status(
        self, check_id: UUID, new_status: BGVCheckStatus, notes: str | None, requester: User
    ) -> BGVCheck:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can update BGV checks.",
            )
        check = await self.repo.get_by_id(check_id)
        if check is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BGV check not found")

        from datetime import datetime, timezone

        check.status = new_status
        check.notes = notes
        check.updated_by = requester.id
        if new_status == BGVCheckStatus.CLEARED:
            check.cleared_at = datetime.now(timezone.utc)
        await self.repo.save(check)

        await self.audit.log(
            requester.id, f"bgv_{new_status.value}", "bgv_check", str(check.id)
        )
        return check
