from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.policy import Policy
from app.models.policy_acknowledgement import PolicyAcknowledgement


class PolicyRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, policy_id: UUID) -> Policy | None:
        result = await self.db.execute(select(Policy).where(Policy.id == policy_id))
        return result.scalar_one_or_none()

    async def get_current_by_title(self, title: str) -> Policy | None:
        result = await self.db.execute(
            select(Policy).where(Policy.title == title, Policy.is_current.is_(True))
        )
        return result.scalar_one_or_none()

    async def list_current(self) -> list[Policy]:
        result = await self.db.execute(
            select(Policy).where(Policy.is_current.is_(True)).order_by(Policy.category, Policy.title)
        )
        return list(result.scalars().all())

    async def list_recent(self, limit: int = 5) -> list[Policy]:
        result = await self.db.execute(
            select(Policy).where(Policy.is_current.is_(True)).order_by(Policy.updated_at.desc()).limit(limit)
        )
        return list(result.scalars().all())

    async def create(self, policy: Policy) -> Policy:
        self.db.add(policy)
        await self.db.flush()
        await self.db.refresh(policy)
        return policy

    async def save(self, policy: Policy) -> Policy:
        await self.db.flush()
        await self.db.refresh(policy)
        return policy


class PolicyAcknowledgementRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, policy_id: UUID, user_id: UUID) -> PolicyAcknowledgement | None:
        result = await self.db.execute(
            select(PolicyAcknowledgement).where(
                PolicyAcknowledgement.policy_id == policy_id,
                PolicyAcknowledgement.user_id == user_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_for_policy(self, policy_id: UUID) -> list[PolicyAcknowledgement]:
        result = await self.db.execute(
            select(PolicyAcknowledgement).where(PolicyAcknowledgement.policy_id == policy_id)
        )
        return list(result.scalars().all())

    async def create(self, ack: PolicyAcknowledgement) -> PolicyAcknowledgement:
        self.db.add(ack)
        await self.db.flush()
        await self.db.refresh(ack)
        return ack
