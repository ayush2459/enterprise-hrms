from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class TravelCreate(BaseModel):
    destination: str = Field(min_length=1, max_length=255)
    purpose: str = Field(min_length=1, max_length=2000)
    start_date: date
    end_date: date
    transport: str | None = Field(default=None, max_length=100)
    accommodation: str | None = Field(default=None, max_length=255)
    estimated_cost: Decimal = Field(gt=0)
    currency: str = Field(default="INR", max_length=10)
    advance_required: bool = False
    advance_amount: Decimal | None = Field(default=None, gt=0)
    notes: str | None = Field(default=None, max_length=2000)
    document_ids: list[UUID] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date < self.start_date:
            raise ValueError("Travel end date cannot be before start date.")
        if self.advance_required and not self.advance_amount:
            raise ValueError("Advance amount is required when advance is requested.")
        return self


class TravelDecision(BaseModel):
    approve: bool
    comment: str | None = Field(default=None, max_length=1000)


class TravelClarification(BaseModel):
    comment: str = Field(min_length=1, max_length=1000)


class TravelSettlement(BaseModel):
    settled_amount: Decimal | None = Field(default=None, gt=0)
    settlement_reference: str | None = Field(default=None, max_length=150)


class TravelRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    employee_id: UUID
    destination: str
    purpose: str
    start_date: date
    end_date: date
    transport: str | None
    accommodation: str | None
    estimated_cost: Decimal
    currency: str
    advance_required: bool
    advance_amount: Decimal | None
    notes: str | None
    status: str
    manager_status: str
    manager_decided_by: UUID | None
    manager_decided_at: datetime | None
    manager_comment: str | None
    hr_status: str
    hr_decided_by: UUID | None
    hr_decided_at: datetime | None
    hr_comment: str | None
    settlement_status: str
    settled_amount: Decimal | None
    settlement_reference: str | None
    settled_at: datetime | None
    document_ids: list[UUID] = Field(default_factory=list)
