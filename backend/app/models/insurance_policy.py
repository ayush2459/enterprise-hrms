"""
Insurance policy — the most data-sensitive module in the spec (Section
5.4). Access is restricted to the employee themself and HR roles only;
even a reporting manager cannot view this, unlike Documents/BGV status
counts which managers can see.
"""
import uuid
from datetime import date

from sqlalchemy import ARRAY, Date, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class InsurancePolicy(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "insurance_policies"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), unique=True, index=True
    )
    policy_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    insurer_name: Mapped[str] = mapped_column(String(150), nullable=False)
    plan_type: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "Family Floater"

    sum_insured: Mapped[int] = mapped_column(Integer, nullable=False)  # in whole currency units
    premium_employer_paid: Mapped[int] = mapped_column(Integer, default=0)
    premium_employee_contribution: Mapped[int] = mapped_column(Integer, default=0)

    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_to: Mapped[date] = mapped_column(Date, nullable=False)

    # e.g. ["Hospitalization", "OPD", "Maternity", "Dental", "Vision", "Critical Illness"]
    benefits: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)

    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    def __repr__(self) -> str:
        return f"<InsurancePolicy {self.policy_number}>"
