from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: int
    title: str
    body: Optional[str] = None
    category: str
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ApprovalDecision(BaseModel):
    approve: bool
    comment: Optional[str] = None


class LeaveApprovalStatusOut(BaseModel):
    id: int
    employee_id: int
    leave_type_id: int
    start_date: str
    end_date: str
    reason: Optional[str] = None
    manager_status: Optional[str] = None
    manager_comment: Optional[str] = None
    hr_status: Optional[str] = None
    hr_comment: Optional[str] = None
    overall_status: str  # derived: pending_manager | pending_hr | approved | rejected

    class Config:
        from_attributes = True
