"""
Employee Master Profile — the core record every other module attaches to
(spec Section 5.1). Sensitive fields (blood_group, personal_address) are
returned only to roles permitted by Section 3's access matrix; that
filtering happens in app/schemas + app/services, not here.
"""
import uuid
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPkMixin
from app.models.enums import (
    ConversionStatus,
    EmployeeStatus,
    EmploymentType,
    OffboardReason,
    SelectionStatus,
)


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

    # Notice period, in days — relevant for interns/contractors whose term
    # is time-bound. An intern serving out their notice period can request
    # conversion to full-time; conversion_status tracks that request.
    notice_period_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    conversion_status: Mapped[ConversionStatus] = mapped_column(
        Enum(ConversionStatus, name="conversion_status_enum"), default=ConversionStatus.NOT_APPLICABLE
    )

    # Offboarding — who left, why, and when. Kept on the record (rather than
    # hard-deleted) so a "people who left" view stays possible; active
    # lists/dashboard counts filter status != OFFBOARDED instead.
    offboard_reason: Mapped[OffboardReason | None] = mapped_column(
        Enum(OffboardReason, name="offboard_reason_enum"), nullable=True
    )
    offboarded_at: Mapped[date | None] = mapped_column(Date, nullable=True)

    # ---- Sensitive / access-restricted fields (Section 3, Section 6) ----
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(30), nullable=True)
    personal_address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    blood_group: Mapped[str | None] = mapped_column(String(5), nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(String(50), nullable=True)
    personal_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mobile_number: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Banking / statutory — the most sensitive fields on this record. Same
    # visibility rule as the rest of this block (HR Admin/Executive/System
    # Admin, or the employee themself) — never shown in the public directory.
    bank_account_number: Mapped[str | None] = mapped_column(String(40), nullable=True)
    bank_ifsc: Mapped[str | None] = mapped_column(String(20), nullable=True)
    bank_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    pf_number: Mapped[str | None] = mapped_column(String(40), nullable=True)

    # HR process/checklist tracking used by Smart Dashboard alerts.
    offer_letter_status: Mapped[str | None] = mapped_column(String(120), nullable=True)
    onboarding_email_status: Mapped[str | None] = mapped_column(String(120), nullable=True)
    appraisal_letter_status: Mapped[str | None] = mapped_column(String(120), nullable=True)
    bonus_payout_status: Mapped[str | None] = mapped_column(String(120), nullable=True)
    promotion_letter_status: Mapped[str | None] = mapped_column(String(120), nullable=True)
    resignation_email_status: Mapped[str | None] = mapped_column(String(120), nullable=True)
    resignation_acceptance_status: Mapped[str | None] = mapped_column(String(120), nullable=True)
    experience_relieving_letter_status: Mapped[str | None] = mapped_column(String(120), nullable=True)

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
