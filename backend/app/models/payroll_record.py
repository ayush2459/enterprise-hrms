"""
Payroll — same strict access tier as Insurance (self + HR only, never a
manager). One record per employee per month.
"""
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import PayrollStatus


class PayrollRecord(Base, UUIDPkMixin, TimestampMixin):
    __tablename__ = "payroll_records"
    __table_args__ = (UniqueConstraint("employee_id", "month", name="uq_employee_month_payroll"),)

    employee_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("employees.id", ondelete="CASCADE"), index=True
    )
    month: Mapped[date] = mapped_column(Date, nullable=False)  # stored as first-of-month

    basic_pay: Mapped[int] = mapped_column(Integer, default=0)
    allowances: Mapped[int] = mapped_column(Integer, default=0)
    deductions: Mapped[int] = mapped_column(Integer, default=0)
    net_pay: Mapped[int] = mapped_column(Integer, default=0)

    status: Mapped[PayrollStatus] = mapped_column(
        Enum(PayrollStatus, name="payroll_status_enum"), default=PayrollStatus.DRAFT
    )
    processed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    def __repr__(self) -> str:
        return f"<PayrollRecord {self.employee_id} {self.month}>"
