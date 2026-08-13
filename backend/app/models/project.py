from datetime import date
from uuid import UUID

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin


class EmployeeProject(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "employee_projects"

    employee_id: Mapped[UUID] = mapped_column(
        PGUUID(as_uuid=True),
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    project_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    project_code: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    client_name: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    role: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    project_manager: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="active",
    )

    start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    allocation_percentage: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=100,
    )

    technologies: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    responsibilities: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    achievements: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    remarks: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
