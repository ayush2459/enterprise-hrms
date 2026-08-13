"""
Company assets (laptops, monitors, phones, headsets, etc.) assigned to
employees. Simple assign/return lifecycle — not a full inventory system.
"""
import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class Asset(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "assets"

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), index=True
    )
    asset_type: Mapped[str] = mapped_column(String(60), nullable=False)  # "Laptop", "Mouse", "Headphones"...
    asset_name: Mapped[str] = mapped_column(String(255), nullable=False)  # "MacBook Pro 14\" M3"
    serial_number: Mapped[str | None] = mapped_column(String(120), nullable=True)
    assigned_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    returned_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    def __repr__(self) -> str:
        return f"<Asset {self.asset_name} -> {self.employee_id}>"
