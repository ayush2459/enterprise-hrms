"""
Document metadata. Files themselves live on disk under UPLOAD_ROOT (see
app/core/config.py) — this table tracks status, ownership, and who
verified what, per Section 5.2. Downloads are streamed through an
authenticated endpoint rather than served as static files, so access
control (Section 3/6) is enforced on every read, not just at upload.
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import DocumentStatus


class Document(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "documents"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), index=True
    )
    document_type: Mapped[str] = mapped_column(String(120), nullable=False)  # e.g. "PAN Card", "Offer Letter"
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)  # path on disk under UPLOAD_ROOT
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(nullable=False)

    status: Mapped[DocumentStatus] = mapped_column(
        Enum(DocumentStatus, name="document_status_enum"), default=DocumentStatus.SUBMITTED
    )

    uploaded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    verified_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<Document {self.document_type} for {self.employee_id}>"
