"""
One row per (policy, user) acknowledgement — a timestamped audit trail
of who clicked "I have read and understood," per spec Section 5.5.
Acknowledgements are tied to a specific policy version: a new version
requires re-acknowledgement.
"""
import uuid

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class PolicyAcknowledgement(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "policy_acknowledgements"
    __table_args__ = (UniqueConstraint("policy_id", "user_id", name="uq_policy_user_ack"),)

    policy_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("policies.id", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )

    def __repr__(self) -> str:
        return f"<PolicyAcknowledgement policy={self.policy_id} user={self.user_id}>"
