import uuid
from datetime import date
from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import ConversionStatus, EmployeeStatus, EmploymentType, SelectionStatus


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
    status: EmployeeStatus | None = None


class EmployeeReadPublic(EmployeeBase):
    """Directory-safe view — no sensitive fields (Section 3 access matrix)."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    photo_url: str | None = None
    status: EmployeeStatus
    selection_status: SelectionStatus
    conversion_status: ConversionStatus
    separation_date: date | None = None
    separation_reason: str | None = None


class EmployeeReadFull(EmployeeReadPublic):
    """HR/Admin/self view — includes sensitive fields."""
    date_of_birth: date | None = None
    gender: str | None = None
    personal_address: str | None = None
    blood_group: str | None = None
    emergency_contact: str | None = None
    personal_email: str | None = None


class ConversionDecisionRequest(BaseModel):
    approve: bool


class OffboardRequest(BaseModel):
    """Marks an employee as resigned or fired. Effective date defaults to
    today (server-side) if omitted."""
    status: Literal["resigned", "terminated"]
    reason: str | None = None
    effective_date: date | None = None


class SeparatedEmployee(BaseModel):
    """Row shape for the 'people who have left the company' list —
    directory + dashboard both use this."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    department: str | None = None
    designation: str | None = None
    status: EmployeeStatus
    separation_date: date | None = None
    separation_reason: str | None = None
