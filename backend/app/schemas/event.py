import uuid
from datetime import date
from pydantic import BaseModel


class CompanyEventCreate(BaseModel):
    title: str
    event_date: date
    category: str = "Other"


class CompanyEventRead(BaseModel):
    id: uuid.UUID
    title: str
    event_date: date
    category: str
