import uuid

from sqlalchemy import Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import JobOpeningStatus


class JobOpening(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "job_openings"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    department: Mapped[str] = mapped_column(String(120), nullable=False)
    positions_count: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[JobOpeningStatus] = mapped_column(
        Enum(JobOpeningStatus, name="job_opening_status_enum"), default=JobOpeningStatus.OPEN
    )
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    def __repr__(self) -> str:
        return f"<JobOpening {self.title} ({self.status})>"
