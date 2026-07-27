import uuid

from sqlalchemy import Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import ReviewRating, ReviewStatus


class PerformanceReview(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "performance_reviews"
    __table_args__ = (UniqueConstraint("review_cycle_id", "employee_id", name="uq_cycle_employee_review"),)

    review_cycle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("review_cycles.id", ondelete="CASCADE"), index=True
    )
    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), index=True
    )

    self_assessment: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    manager_assessment: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    rating: Mapped[ReviewRating] = mapped_column(
        Enum(ReviewRating, name="review_rating_enum"), default=ReviewRating.NOT_RATED
    )
    status: Mapped[ReviewStatus] = mapped_column(
        Enum(ReviewStatus, name="review_status_enum"), default=ReviewStatus.PENDING_SELF_ASSESSMENT
    )

    def __repr__(self) -> str:
        return f"<PerformanceReview {self.employee_id} in {self.review_cycle_id}>"
