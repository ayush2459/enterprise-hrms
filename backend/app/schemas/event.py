import uuid
from datetime import date

from pydantic import BaseModel


class CompanyEventCreate(BaseModel):
    title: str
    event_date: date
    category: str = "Other"


class CompanyEventUpdate(BaseModel):
    title: str | None = None
    event_date: date | None = None
    category: str | None = None


class CompanyEventRead(BaseModel):
    id: uuid.UUID
    title: str
    event_date: date
    category: str
