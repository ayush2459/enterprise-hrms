"""
Employee Master Profile — the core record every other module attaches to
(spec Section 5.1). Sensitive fields (blood_group, personal_address) are
returned only to roles permitted by Section 3's access matrix; that
filtering happens in app/schemas + app/services, not here.
"""
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import EmployeeStatus, EmploymentType, SelectionStatus


class Employee(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "employees"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True
    )

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    department: Mapped[str | None] = mapped_column(String(120), nullable=True)
    designation: Mapped[str | None] = mapped_column(String(120), nullable=True)
    employment_type: Mapped[EmploymentType] = mapped_column(
        Enum(EmploymentType, name="employment_type_enum"), default=EmploymentType.FULL_TIME
    )
    date_of_joining: Mapped[date | None] = mapped_column(Date, nullable=True)

    # ---- Sensitive / access-restricted fields (Section 3, Section 6) ----
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(30), nullable=True)
    personal_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(5), nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(50), nullable=True)
    personal_email: Mapped[str | None] = mapped_column(String(255), nullable=True)

    selection_status: Mapped[SelectionStatus] = mapped_column(
        Enum(SelectionStatus, name="selection_status_enum"), default=SelectionStatus.JOINED
    )
    status: Mapped[EmployeeStatus] = mapped_column(
        Enum(EmployeeStatus, name="employee_status_enum"), default=EmployeeStatus.ACTIVE
    )

    reporting_manager_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id", ondelete="SET NULL"), nullable=True
    )

    user: Mapped["User"] = relationship(back_populates="employee", foreign_keys=[user_id])  # noqa: F821
    manager: Mapped["Employee | None"] = relationship(
        remote_side="Employee.id", foreign_keys=[reporting_manager_id]
    )

    def __repr__(self) -> str:
        return f"<Employee {self.full_name}>"
