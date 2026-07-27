from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dependent import Dependent
from app.models.insurance_policy import InsurancePolicy


class InsurancePolicyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_employee_id(self, employee_id: UUID) -> InsurancePolicy | None:
        result = await self.db.execute(
            select(InsurancePolicy).where(InsurancePolicy.employee_id == employee_id)
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, policy_id: UUID) -> InsurancePolicy | None:
        result = await self.db.execute(select(InsurancePolicy).where(InsurancePolicy.id == policy_id))
        return result.scalar_one_or_none()

    async def create(self, policy: InsurancePolicy) -> InsurancePolicy:
        self.db.add(policy)
        await self.db.flush()
        await self.db.refresh(policy)
        return policy

    async def save(self, policy: InsurancePolicy) -> InsurancePolicy:
        await self.db.flush()
        await self.db.refresh(policy)
        return policy

    async def count_all(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(InsurancePolicy))
        return result.scalar_one()


class DependentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, dependent_id: UUID) -> Dependent | None:
        result = await self.db.execute(select(Dependent).where(Dependent.id == dependent_id))
        return result.scalar_one_or_none()

    async def list_by_policy(self, policy_id: UUID) -> list[Dependent]:
        result = await self.db.execute(select(Dependent).where(Dependent.insurance_policy_id == policy_id))
        return list(result.scalars().all())

    async def count_by_policy(self, policy_id: UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Dependent).where(Dependent.insurance_policy_id == policy_id)
        )
        return result.scalar_one()

    async def count_unverified(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Dependent).where(Dependent.verified.is_(False))
        )
        return result.scalar_one()

    async def create(self, dependent: Dependent) -> Dependent:
        self.db.add(dependent)
        await self.db.flush()
        await self.db.refresh(dependent)
        return dependent

    async def save(self, dependent: Dependent) -> Dependent:
        await self.db.flush()
        await self.db.refresh(dependent)
        return dependent
