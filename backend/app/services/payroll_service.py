"""
Payroll business logic. Same access tier as Insurance (Section 5.4
precedent): only the employee themself or HR roles — never a manager.
"""
from datetime import date
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import PayrollStatus, RoleEnum
from app.models.payroll_record import PayrollRecord
from app.models.user import User
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.payroll_repository import PayrollRepository
from app.services.audit_service import AuditService

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class PayrollService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.records = PayrollRepository(db)
        self.employees = EmployeeRepository(db)
        self.audit = AuditService(db)

    async def _assert_access(self, employee_id: UUID, requester: User) -> None:
        if requester.role in HR_ROLES:
            return
        employee = await self.employees.get_by_id(employee_id)
        if employee is None or employee.user_id != requester.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Payroll details are only visible to the employee themself or HR.",
            )

    async def list_for_employee(self, employee_id: UUID, requester: User) -> list[PayrollRecord]:
        await self._assert_access(employee_id, requester)
        await self.audit.log(requester.id, "payroll_view", "employee", str(employee_id))
        return await self.records.list_by_employee(employee_id)

    async def create_record(
        self, employee_id: UUID, month: date, basic_pay: int, allowances: int, deductions: int, requester: User
    ) -> PayrollRecord:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can process payroll.",
            )
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        month_start = month.replace(day=1)
        existing = await self.records.get_by_employee_and_month(employee_id, month_start)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="A payroll record already exists for this month."
            )

        net_pay = basic_pay + allowances - deductions
        record = PayrollRecord(
            employee_id=employee_id,
            month=month_start,
            basic_pay=basic_pay,
            allowances=allowances,
            deductions=deductions,
            net_pay=net_pay,
            status=PayrollStatus.DRAFT,
            processed_by=requester.id,
        )
        await self.records.create(record)
        await self.audit.log(requester.id, "payroll_create", "employee", str(employee_id))
        return record

    async def update_status(self, record_id: UUID, new_status: PayrollStatus, requester: User) -> PayrollRecord:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can update payroll status.",
            )
        record = await self.records.get_by_id(record_id)
        if record is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payroll record not found")
        record.status = new_status
        await self.records.save(record)
        await self.audit.log(requester.id, f"payroll_{new_status.value}", "payroll_record", str(record_id))
        return record
