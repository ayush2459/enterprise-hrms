from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    amount: Decimal = Field(gt=0)
    currency: str = Field(default="INR", max_length=10)
    expense_date: date
    description: str = Field(min_length=1, max_length=2000)
    document_ids: list[UUID] = Field(default_factory=list)


class ExpenseDecision(BaseModel):
    approve: bool
    comment: str | None = Field(default=None, max_length=1000)


class ExpenseClarification(BaseModel):
    comment: str = Field(min_length=1, max_length=1000)


class ExpenseSettlement(BaseModel):
    settled_amount: Decimal | None = Field(default=None, gt=0)
    settlement_reference: str | None = Field(default=None, max_length=150)


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    employee_id: UUID
    category: str
    amount: Decimal
    currency: str
    expense_date: date
    description: str
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


class ApprovalHistoryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    request_type: str
    request_id: UUID
    action: str
    performed_by: UUID
    comment: str | None
    created_at: datetime
