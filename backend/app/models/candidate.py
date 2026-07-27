import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import CandidateStage


class Candidate(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "candidates"

    job_opening_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("job_openings.id", ondelete="CASCADE"), index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)

    resume_file_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resume_file_path: Mapped[str | None] = mapped_column(String(512), nullable=True)
    resume_mime_type: Mapped[str | None] = mapped_column(String(120), nullable=True)
    resume_file_size: Mapped[int | None] = mapped_column(nullable=True)

    stage: Mapped[CandidateStage] = mapped_column(
        Enum(CandidateStage, name="candidate_stage_enum"), default=CandidateStage.APPLIED
    )
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Set once the candidate is converted into an Employee (Onboarding takes over from there).
    converted_employee_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True
    )

    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    def __repr__(self) -> str:
        return f"<Candidate {self.full_name} ({self.stage})>"
