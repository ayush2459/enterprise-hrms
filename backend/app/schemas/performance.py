import uuid
from datetime import date
from pydantic import BaseModel, ConfigDict

from app.models.enums import ReviewCycleStatus, ReviewRating, ReviewStatus


class ReviewCycleCreate(BaseModel):
    name: str
    start_date: date
    end_date: date


class ReviewCycleStatusUpdate(BaseModel):
    status: ReviewCycleStatus


class ReviewCycleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    start_date: date
    end_date: date
    status: ReviewCycleStatus


class PerformanceReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    review_cycle_id: uuid.UUID
    employee_id: uuid.UUID
    self_assessment: str | None = None
    manager_assessment: str | None = None
    rating: ReviewRating
    status: ReviewStatus


class SelfAssessmentUpdate(BaseModel):
    self_assessment: str


class ManagerAssessmentUpdate(BaseModel):
    manager_assessment: str
    rating: ReviewRating
