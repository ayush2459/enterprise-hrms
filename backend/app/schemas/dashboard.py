import uuid
from datetime import date
from pydantic import BaseModel

from app.models.enums import EmployeeStatus


class DepartmentBreakdown(BaseModel):
    department: str
    count: int


class HeadcountPoint(BaseModel):
    month: str  # "2026-01"
    count: int  # cumulative headcount as of that month


class RecentJoiner(BaseModel):
    id: uuid.UUID
    full_name: str
    designation: str | None = None
    department: str | None = None
    date_of_joining: date | None = None


class SeparatedEmployeeSummary(BaseModel):
    """Row shape for the dashboard's real-time 'people who left' panel."""
    id: uuid.UUID
    full_name: str
    designation: str | None = None
    department: str | None = None
    status: EmployeeStatus
    separation_date: date | None = None
    separation_reason: str | None = None


class PendingApprovals(BaseModel):
    leave_requests: int
    document_verifications: int
    background_checks: int
    dependent_verifications: int


class PolicyUpdate(BaseModel):
    id: uuid.UUID
    title: str
    category: str
    version: int


class UpcomingEvent(BaseModel):
    employee_id: uuid.UUID | None = None
    full_name: str  # employee name for birthday/anniversary, or the event title for a custom event
    event_type: str  # "birthday" | "work_anniversary" | "company_event"
    event_date: date
    category: str | None = None  # set for company_event only


class DashboardSummary(BaseModel):
    total_employees: int
    active_today: int
    new_joiners_30d: int
    pending_bgv: int
    insurance_pending: int
    pending_document_verifications: int
    leaves_today: int
    total_separated: int
    employees_by_department: list[DepartmentBreakdown]
    headcount_trend: list[HeadcountPoint]
    recent_joiners: list[RecentJoiner]
    recently_separated: list[SeparatedEmployeeSummary]
    pending_approvals: PendingApprovals
    policy_updates: list[PolicyUpdate]
    upcoming_events: list[UpcomingEvent]
