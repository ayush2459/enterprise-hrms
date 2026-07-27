import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import AttendanceStatus


class AttendanceMarkRequest(BaseModel):
    date: date
    status: AttendanceStatus


class AttendanceRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    date: date
    status: AttendanceStatus


class AttendanceSummary(BaseModel):
    present: int
    absent: int
    half_day: int
    on_leave: int
    holiday: int
