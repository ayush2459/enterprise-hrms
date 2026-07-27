import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class CompanyEvent(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "company_events"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String(60), default="Other")  # e.g. Team Outing, Holiday, Induction
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    def __repr__(self) -> str:
        return f"<CompanyEvent {self.title} on {self.event_date}>"
