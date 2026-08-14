import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import LeaveRequestStatus


class LeaveTypeCreate(BaseModel):
    name: str
    annual_quota_days: int = 12
    eligibility_gender: str = "all"
    is_paid: bool = True
    carry_forward_allowed: bool = False
    max_carry_forward_days: int = 0
    encashment_allowed: bool = False
    requires_document: bool = False
    requires_reason: bool = False
    min_days: int = 1
    max_days: int = 365
    advance_notice_days: int = 0
    is_active: bool = True


class LeaveTypeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    annual_quota_days: int
    eligibility_gender: str
    is_paid: bool
    carry_forward_allowed: bool
    max_carry_forward_days: int
    encashment_allowed: bool
    requires_document: bool
    requires_reason: bool
    min_days: int
    max_days: int
    advance_notice_days: int
    is_active: bool


class LeaveRequestCreate(BaseModel):
    leave_type_id: uuid.UUID
    start_date: date
    end_date: date
    reason: str | None = None


class LeaveRequestDecision(BaseModel):
    status: LeaveRequestStatus  # expected: APPROVED or REJECTED


class LeaveRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    leave_type_id: uuid.UUID
    start_date: date
    end_date: date
    reason: str | None = None
    status: LeaveRequestStatus


class LeaveBalance(BaseModel):
    leave_type_id: uuid.UUID
    leave_type_name: str
    annual_quota_days: int
    days_used: int
    days_remaining: int
