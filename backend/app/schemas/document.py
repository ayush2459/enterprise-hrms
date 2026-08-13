from typing import Literal

HR_DOCUMENT_TYPES = (
    "pan_card",
    "aadhaar_card",
    "resume",
    "passport",
    "photograph",
    "address_proof",
    "bank_proof",
    "educational_certificate",
    "class_10_certificate",
    "class_12_certificate",
    "graduation_certificate",
    "employment_proof",
    "joining_letter",
    "offer_letter",
    "appraisal_letter",
    "relieving_letter",
    "experience_letter",
    "other",
)

HRDocumentType = Literal[
    "pan_card",
    "aadhaar_card",
    "resume",
    "passport",
    "photograph",
    "address_proof",
    "bank_proof",
    "educational_certificate",
    "class_10_certificate",
    "class_12_certificate",
    "graduation_certificate",
    "employment_proof",
    "joining_letter",
    "offer_letter",
    "appraisal_letter",
    "relieving_letter",
    "experience_letter",
    "other",
]


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
