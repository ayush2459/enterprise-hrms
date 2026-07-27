import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.enums import DocumentStatus


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    document_type: str
    file_name: str
    mime_type: str
    file_size_bytes: int
    status: DocumentStatus
    verified_at: datetime | None = None
    notes: str | None = None
    created_at: datetime


class DocumentVerifyRequest(BaseModel):
    status: DocumentStatus  # expected: VERIFIED or REJECTED
    notes: str | None = None
