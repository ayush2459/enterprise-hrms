import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import PayrollStatus


class PayrollRecordCreate(BaseModel):
    month: date  # any date within the target month; stored as first-of-month
    basic_pay: int
    allowances: int = 0
    deductions: int = 0


class PayrollRecordUpdate(BaseModel):
    month: date
    basic_pay: int
    allowances: int = 0
    deductions: int = 0


class PayrollStatusUpdate(BaseModel):
    status: PayrollStatus


class PayrollRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    month: date
    basic_pay: int
    allowances: int
    deductions: int
    net_pay: int
    status: PayrollStatus
