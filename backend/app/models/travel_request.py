import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class TravelRequest(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "travel_requests"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)

    transport: Mapped[str | None] = mapped_column(String(100), nullable=True)
    accommodation: Mapped[str | None] = mapped_column(String(255), nullable=True)

    estimated_cost: Mapped[Decimal] = mapped_column(
        Numeric(12, 2), nullable=False
    )
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)

    advance_required: Mapped[bool] = mapped_column(
        default=False, nullable=False
    )
    advance_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )

    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    status: Mapped[str] = mapped_column(
        String(40), default="pending_manager", nullable=False, index=True
    )

    manager_status: Mapped[str] = mapped_column(
        String(30), default="pending", nullable=False
    )
    manager_decided_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    manager_decided_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    manager_comment: Mapped[str | None] = mapped_column(
        String(1000), nullable=True
    )

    hr_status: Mapped[str] = mapped_column(
        String(30), default="pending", nullable=False
    )
    hr_decided_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    hr_decided_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    hr_comment: Mapped[str | None] = mapped_column(
        String(1000), nullable=True
    )

    settlement_status: Mapped[str] = mapped_column(
        String(30), default="unsettled", nullable=False
    )
    settled_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )
    settlement_reference: Mapped[str | None] = mapped_column(
        String(150), nullable=True
    )
    settled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
