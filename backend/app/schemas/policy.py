import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PolicyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    category: str
    version: int
    file_name: str
    file_size_bytes: int
    created_at: datetime


class PolicyReadWithAck(PolicyRead):
    """What the employee-facing list returns — includes whether *this*
    user has acknowledged the current version."""
    acknowledged: bool


class PolicyAcknowledgementStatus(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    full_name: str
    acknowledged: bool
    acknowledged_at: datetime | None = None
