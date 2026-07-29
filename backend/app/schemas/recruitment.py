import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.enums import CandidateStage, JobOpeningStatus


class JobOpeningCreate(BaseModel):
    title: str
    department: str
    positions_count: int = 1


class JobOpeningStatusUpdate(BaseModel):
    status: JobOpeningStatus


class JobOpeningRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    department: str
    positions_count: int
    status: JobOpeningStatus
    created_at: datetime


class CandidateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    job_opening_id: uuid.UUID
    full_name: str
    email: str
    phone: str | None = None
    notice_period_days: int | None = None
    resume_file_name: str | None = None
    stage: CandidateStage
    notes: str | None = None
    converted_employee_id: uuid.UUID | None = None
    created_at: datetime


class CandidateStageUpdate(BaseModel):
    stage: CandidateStage
    notes: str | None = None


class CandidateConvertResponse(BaseModel):
    employee_id: uuid.UUID
    official_email: str
    temporary_password: str
