import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import ReviewCycleStatus


class ReviewCycle(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "review_cycles"

    name: Mapped[str] = mapped_column(String(150), nullable=False)  # e.g. "H1 2026 Review"
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[ReviewCycleStatus] = mapped_column(
        Enum(ReviewCycleStatus, name="review_cycle_status_enum"), default=ReviewCycleStatus.ACTIVE
    )
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    def __repr__(self) -> str:
        return f"<ReviewCycle {self.name}>"
