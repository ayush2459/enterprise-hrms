import uuid
from datetime import date
from pydantic import BaseModel


class OnboardingChecklistItem(BaseModel):
    label: str
    complete: bool


class OnboardingStatus(BaseModel):
    employee_id: uuid.UUID
    full_name: str
    date_of_joining: date | None = None
    documents: list[OnboardingChecklistItem]
    bgv: list[OnboardingChecklistItem]
    all_complete: bool
