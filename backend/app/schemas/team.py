import uuid
from pydantic import BaseModel

from app.models.enums import EmployeeStatus, EmploymentType


class TeamMemberRead(BaseModel):
    id: uuid.UUID
    full_name: str
    designation: str | None = None
    department: str | None = None
    official_email: str
    status: EmployeeStatus
    employment_type: EmploymentType


class OrgSnippet(BaseModel):
    manager: TeamMemberRead | None
    direct_reports: list[TeamMemberRead]


class TeamStatusRow(BaseModel):
    employee_id: uuid.UUID
    full_name: str
    documents_verified: int
    documents_total: int
    bgv_cleared: int
    bgv_total: int
