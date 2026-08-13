import uuid
from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class AssetCreate(BaseModel):
    employee_id: uuid.UUID
    asset_type: str
    asset_name: str
    serial_number: str | None = None
    assigned_date: date | None = None
    notes: str | None = None


class AssetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    asset_type: str
    asset_name: str
    serial_number: str | None = None
    assigned_date: date | None = None
    returned_date: date | None = None
    notes: str | None = None
    created_at: datetime


class AssetReturnRequest(BaseModel):
    returned_date: date | None = None  # defaults to today if omitted
