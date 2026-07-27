import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import LeaveRequestStatus


class LeaveTypeCreate(BaseModel):
    name: str
    annual_quota_days: int = 12


class LeaveTypeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    annual_quota_days: int


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
