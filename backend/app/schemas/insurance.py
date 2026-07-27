import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict


class InsurancePolicyUpsert(BaseModel):
    policy_number: str
    insurer_name: str
    plan_type: str
    sum_insured: int
    premium_employer_paid: int = 0
    premium_employee_contribution: int = 0
    valid_from: date
    valid_to: date
    benefits: list[str] = []


class InsurancePolicyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    employee_id: uuid.UUID
    policy_number: str
    insurer_name: str
    plan_type: str
    sum_insured: int
    premium_employer_paid: int
    premium_employee_contribution: int
    valid_from: date
    valid_to: date
    benefits: list[str]


class DependentCreate(BaseModel):
    full_name: str
    relationship: str
    date_of_birth: date


class DependentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    relationship: str
    date_of_birth: date
    card_id: str
    verified: bool


class InsuranceFullRead(BaseModel):
    policy: InsurancePolicyRead | None
    dependents: list[DependentRead]
