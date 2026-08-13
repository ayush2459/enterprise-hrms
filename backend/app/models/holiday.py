"""
Company holiday calendar — one row per holiday per year.
"""
import uuid
from datetime import date

from sqlalchemy import Boolean, Date, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class Holiday(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "holidays"

    name: Mapped[str] = mapped_column(String(120), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    is_optional: Mapped[bool] = mapped_column(Boolean, default=False)

    def __repr__(self) -> str:
        return f"<Holiday {self.name} on {self.date}>"
