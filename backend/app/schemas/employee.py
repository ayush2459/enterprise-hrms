import uuid
from uuid import UUID
from datetime import date
from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import ConversionStatus, EmployeeStatus, EmploymentType, OffboardReason, SelectionStatus


class EmployeeBase(BaseModel):
    full_name: str
    department: str | None = None
    designation: str | None = None
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    date_of_joining: date | None = None
    reporting_manager_id: uuid.UUID | None = None
    notice_period_days: int | None = None


class EmployeeCreate(EmployeeBase):
    user_id: uuid.UUID


class EmployeeCreateRequest(EmployeeBase):
    """What the Add Employee form submits — creates the User (login
    identity) and Employee (HR profile) together in one call."""
    official_email: EmailStr
    employee_id: str | None = None


class EmployeeCreateResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    official_email: str
    temporary_password: str


class OffboardedEmployee(BaseModel):
    """Employee representation used by the former/offboarded employees view."""

    id: UUID
    full_name: str
    designation: str | None = None
    department: str | None = None
    offboard_reason: OffboardReason | None = None
    offboarded_at: date | None = None

    model_config = ConfigDict(from_attributes=True)


class EmployeeStats(BaseModel):
    total_employees: int
    active_today: int
    pending_bgv: int | None = None  # populated once the BGV module (Sprint 2) exists
    policy_acknowledgements_due: int | None = None  # populated once Policies (Sprint 4) exists


class EmployeeUpdate(BaseModel):
    full_name: str | None = None
    department: str | None = None
    designation: str | None = None
    employment_type: EmploymentType | None = None
    reporting_manager_id: uuid.UUID | None = None
    notice_period_days: int | None = None
    date_of_birth: date | None = None
    gender: str | None = None
    personal_address: str | None = None
    blood_group: str | None = None
    emergency_contact: str | None = None
    personal_email: str | None = None
    mobile_number: str | None = None
    bank_account_number: str | None = None
    bank_ifsc: str | None = None
    bank_name: str | None = None
    pf_number: str | None = None
    status: EmployeeStatus | None = None


class EmployeeReadPublic(EmployeeBase):
    """Directory-safe view — no sensitive fields (Section 3 access matrix)."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    gender: str | None = None
    photo_url: str | None = None
    status: EmployeeStatus
    selection_status: SelectionStatus
    conversion_status: ConversionStatus
    offboard_reason: OffboardReason | None = None
    offboarded_at: date | None = None


class EmployeeReadFull(EmployeeReadPublic):
    """HR/Admin/self view — includes sensitive fields."""
    date_of_birth: date | None = None
    gender: str | None = None
    personal_address: str | None = None
    blood_group: str | None = None
    emergency_contact: str | None = None
    personal_email: str | None = None
    mobile_number: str | None = None
    bank_account_number: str | None = None
    bank_ifsc: str | None = None
    bank_name: str | None = None
    pf_number: str | None = None


class SeparatedEmployee(BaseModel):
    """Former employee shown in the separated/former employees list."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    designation: str | None = None
    department: str | None = None
    status: EmployeeStatus
    offboard_reason: OffboardReason | None = None
    offboarded_at: date | None = None


class ConversionDecisionRequest(BaseModel):
    approve: bool


class OffboardRequest(BaseModel):
    reason: OffboardReason
