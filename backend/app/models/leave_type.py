from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class LeaveType(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "leave_types"

    name: Mapped[str] = mapped_column(
        String(60),
        unique=True,
        nullable=False,
    )

    annual_quota_days: Mapped[int] = mapped_column(
        Integer,
        default=12,
        nullable=False,
    )

    eligibility_gender: Mapped[str] = mapped_column(
        String(20),
        default="all",
        nullable=False,
    )

    is_paid: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    carry_forward_allowed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    max_carry_forward_days: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    encashment_allowed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    requires_document: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    requires_reason: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    min_days: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    max_days: Mapped[int] = mapped_column(
        Integer,
        default=365,
        nullable=False,
    )

    advance_notice_days: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    def __repr__(self) -> str:
        return (
            f"<LeaveType {self.name} "
            f"({self.annual_quota_days}d/yr, "
            f"{self.eligibility_gender}, "
            f"{'paid' if self.is_paid else 'unpaid'})>"
        )
