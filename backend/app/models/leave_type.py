from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class LeaveType(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "leave_types"

    name: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)  # e.g. "Casual", "Sick", "Earned"
    annual_quota_days: Mapped[int] = mapped_column(Integer, default=12)

    def __repr__(self) -> str:
        return f"<LeaveType {self.name} ({self.annual_quota_days}d/yr)>"
