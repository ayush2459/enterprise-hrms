"""
Insurance business logic. Section 5.4 calls this the most data-sensitive
module and asks for the tightest field-level access control — so unlike
Documents/BGV (visible to managers as counts) or the org chart (visible
to everyone), insurance details are visible to nobody except the
employee themself and HR roles.
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dependent import Dependent
from app.models.enums import RoleEnum
from app.models.insurance_policy import InsurancePolicy
from app.models.user import User
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.insurance_repository import DependentRepository, InsurancePolicyRepository
from app.schemas.insurance import DependentCreate, InsuranceFullRead, InsurancePolicyUpsert
from app.services.audit_service import AuditService

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class InsuranceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.policies = InsurancePolicyRepository(db)
        self.dependents = DependentRepository(db)
        self.employees = EmployeeRepository(db)
        self.audit = AuditService(db)

    async def _assert_access(self, employee_id: UUID, requester: User) -> None:
        if requester.role in HR_ROLES:
            return
        employee = await self.employees.get_by_id(employee_id)
        if employee is None or employee.user_id != requester.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insurance details are only visible to the employee themself or HR.",
            )

    async def get_for_employee(self, employee_id: UUID, requester: User) -> InsuranceFullRead:
        await self._assert_access(employee_id, requester)
        policy = await self.policies.get_by_employee_id(employee_id)
        dependents = await self.dependents.list_by_policy(policy.id) if policy else []
        await self.audit.log(requester.id, "insurance_view", "employee", str(employee_id))
        return InsuranceFullRead(policy=policy, dependents=dependents)

    async def upsert_policy(
        self, employee_id: UUID, payload: InsurancePolicyUpsert, requester: User
    ) -> InsurancePolicy:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can manage policy details.",
            )
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        existing = await self.policies.get_by_employee_id(employee_id)
        if existing:
            for field, value in payload.model_dump().items():
                setattr(existing, field, value)
            await self.policies.save(existing)
            await self.audit.log(requester.id, "insurance_policy_update", "employee", str(employee_id))
            return existing

        policy = InsurancePolicy(employee_id=employee_id, created_by=requester.id, **payload.model_dump())
        await self.policies.create(policy)
        await self.audit.log(requester.id, "insurance_policy_create", "employee", str(employee_id))
        return policy

    async def add_dependent(
        self, employee_id: UUID, payload: DependentCreate, requester: User
    ) -> Dependent:
        await self._assert_access(employee_id, requester)
        policy = await self.policies.get_by_employee_id(employee_id)
        if policy is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This employee has no insurance policy yet — HR must add one first.",
            )

        existing_count = await self.dependents.count_by_policy(policy.id)
        card_id = f"{policy.policy_number}-D{existing_count + 1}"

        dependent = Dependent(
            insurance_policy_id=policy.id,
            full_name=payload.full_name,
            relationship=payload.relationship,
            date_of_birth=payload.date_of_birth,
            card_id=card_id,
        )
        await self.dependents.create(dependent)
        await self.audit.log(requester.id, "dependent_add", "employee", str(employee_id))
        return dependent

    async def verify_dependent(self, dependent_id: UUID, requester: User) -> Dependent:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can verify dependents.",
            )
        dependent = await self.dependents.get_by_id(dependent_id)
        if dependent is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dependent not found")
        dependent.verified = True
        await self.dependents.save(dependent)
        await self.audit.log(requester.id, "dependent_verify", "dependent", str(dependent_id))
        return dependent
