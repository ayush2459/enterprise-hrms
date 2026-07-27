"""
Covered family members under a policy. Employees add/edit their own
dependents; HR verifies them before a digital card is treated as valid,
matching spec Section 5.4.
"""
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class Dependent(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "dependents"

    insurance_policy_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("insurance_policies.id", ondelete="CASCADE"), index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    relationship: Mapped[str] = mapped_column(String(50), nullable=False)  # spouse, child, parent, ...
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)
    card_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)

    def __repr__(self) -> str:
        return f"<Dependent {self.full_name} ({self.relationship})>"
