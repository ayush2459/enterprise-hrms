import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict


class HolidayCreate(BaseModel):
    name: str
    date: date
    is_optional: bool = False


class HolidayRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    date: date
    is_optional: bool
