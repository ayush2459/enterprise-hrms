import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.enums import BGVCheckStatus

CHECK_TYPES = ("education", "employment", "address", "criminal", "reference")


class BGVCheckCreate(BaseModel):
    check_type: str  # one of CHECK_TYPES


class BGVCheckUpdate(BaseModel):
    status: BGVCheckStatus
    notes: str | None = None


class BGVCheckRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    check_type: str
    status: BGVCheckStatus
    notes: str | None = None
    cleared_at: datetime | None = None
    updated_at: datetime
