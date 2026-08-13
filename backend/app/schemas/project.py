from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjectBase(BaseModel):
    project_name: str
    project_code: str | None = None
    client_name: str | None = None
    role: str | None = None
    project_manager: str | None = None
    status: str = "active"
    start_date: date | None = None
    end_date: date | None = None
    allocation_percentage: int = Field(default=100, ge=0, le=100)
    technologies: str | None = None
    description: str | None = None
    responsibilities: str | None = None
    achievements: str | None = None
    remarks: str | None = None


class ProjectCreate(ProjectBase):
    employee_id: UUID


class ProjectUpdate(ProjectBase):
    pass


class ProjectRead(ProjectBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    employee_id: UUID
