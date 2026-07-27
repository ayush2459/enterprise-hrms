"""
Background verification pipeline. One row per check type per employee
(education, employment, address, criminal, reference — matches the
BGV Tracker in spec Section 5.3). Notes are HR-only and never exposed to
the employee's own view.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import BGVCheckStatus


class BGVCheck(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "bgv_checks"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), index=True
    )
    check_type: Mapped[str] = mapped_column(String(60), nullable=False)  # education | employment | address | criminal | reference
    status: Mapped[BGVCheckStatus] = mapped_column(
        Enum(BGVCheckStatus, name="bgv_check_status_enum"), default=BGVCheckStatus.INITIATED
    )
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)  # HR-only

    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    cleared_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<BGVCheck {self.check_type} for {self.employee_id}: {self.status}>"
