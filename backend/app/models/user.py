"""
User = the authentication/authorization identity (Section 7: Authentication
& Validation System). Employee = the HR profile (Section 5.1). Kept as
separate tables: a System Admin, for instance, may not need an Employee
record at all.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import RoleEnum


class User(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "users"

    official_email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    employee_id: Mapped[str | None] = mapped_column(String(50), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(Enum(RoleEnum, name="role_enum"), nullable=False, default=RoleEnum.EMPLOYEE)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ---- MFA (Section 7) ----
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    mfa_secret: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # ---- Brute-force protection (Section 7) ----
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0)
    locked_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    employee: Mapped["Employee"] = relationship(  # noqa: F821
        back_populates="user", uselist=False, foreign_keys="Employee.user_id"
    )

    def __repr__(self) -> str:
        return f"<User {self.official_email} ({self.role})>"
