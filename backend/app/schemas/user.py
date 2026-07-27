import uuid
from pydantic import BaseModel, EmailStr, ConfigDict

from app.models.enums import RoleEnum


class UserBase(BaseModel):
    official_email: EmailStr
    employee_id: str | None = None
    role: RoleEnum = RoleEnum.EMPLOYEE


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    is_active: bool
    mfa_enabled: bool
