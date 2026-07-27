"""
Performance review workflow: HR opens a cycle and initiates reviews,
the employee fills in a self-assessment, then their manager (or HR)
adds the manager assessment + rating to close it out.
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import ReviewCycleStatus, ReviewRating, ReviewStatus, RoleEnum
from app.models.performance_review import PerformanceReview
from app.models.review_cycle import ReviewCycle
from app.models.user import User
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.performance_repository import PerformanceReviewRepository, ReviewCycleRepository
from app.services.audit_service import AuditService

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class PerformanceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.cycles = ReviewCycleRepository(db)
        self.reviews = PerformanceReviewRepository(db)
        self.employees = EmployeeRepository(db)
        self.audit = AuditService(db)

    # ---- Review cycles (HR only) ----
    async def list_cycles(self) -> list[ReviewCycle]:
        return await self.cycles.list_all()

    async def create_cycle(self, name: str, start_date, end_date, requester: User) -> ReviewCycle:
        if requester.role not in HR_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR only.")
        cycle = ReviewCycle(name=name, start_date=start_date, end_date=end_date, created_by=requester.id)
        await self.cycles.create(cycle)
        await self.audit.log(requester.id, "review_cycle_create", "review_cycle", str(cycle.id))
        return cycle

    async def update_cycle_status(
        self, cycle_id: UUID, new_status: ReviewCycleStatus, requester: User
    ) -> ReviewCycle:
        if requester.role not in HR_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR only.")
        cycle = await self.cycles.get_by_id(cycle_id)
        if cycle is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review cycle not found")
        cycle.status = new_status
        await self.cycles.save(cycle)
        return cycle

    # ---- Reviews ----
    async def _assert_view_access(self, employee_id: UUID, requester: User) -> None:
        if requester.role in HR_ROLES:
            return
        employee = await self.employees.get_by_id(employee_id)
        requester_employee = await self.employees.get_by_user_id(requester.id)
        is_self = employee is not None and employee.user_id == requester.id
        is_manager = (
            requester_employee is not None
            and employee is not None
            and employee.reporting_manager_id == requester_employee.id
        )
        if not (is_self or is_manager):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    async def list_for_employee(self, employee_id: UUID, requester: User) -> list[PerformanceReview]:
        await self._assert_view_access(employee_id, requester)
        return await self.reviews.list_by_employee(employee_id)

    async def initiate_review(self, cycle_id: UUID, employee_id: UUID, requester: User) -> PerformanceReview:
        if requester.role not in HR_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR only.")
        existing = await self.reviews.get_by_cycle_and_employee(cycle_id, employee_id)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Review already exists.")
        review = PerformanceReview(review_cycle_id=cycle_id, employee_id=employee_id)
        await self.reviews.create(review)
        await self.audit.log(requester.id, "review_initiate", "performance_review", str(review.id))
        return review

    async def submit_self_assessment(
        self, review_id: UUID, self_assessment: str, requester: User
    ) -> PerformanceReview:
        review = await self.reviews.get_by_id(review_id)
        if review is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

        if requester.role not in HR_ROLES:
            employee = await self.employees.get_by_id(review.employee_id)
            if employee is None or employee.user_id != requester.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the employee (or HR, on their behalf) can submit this self-assessment.",
                )

        review.self_assessment = self_assessment
        review.status = ReviewStatus.PENDING_MANAGER_REVIEW
        await self.reviews.save(review)
        await self.audit.log(requester.id, "self_assessment_submit", "performance_review", str(review_id))
        return review

    async def submit_manager_assessment(
        self, review_id: UUID, manager_assessment: str, rating: ReviewRating, requester: User
    ) -> PerformanceReview:
        review = await self.reviews.get_by_id(review_id)
        if review is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

        if requester.role not in HR_ROLES:
            employee = await self.employees.get_by_id(review.employee_id)
            requester_employee = await self.employees.get_by_user_id(requester.id)
            is_manager = (
                requester_employee is not None
                and employee is not None
                and employee.reporting_manager_id == requester_employee.id
            )
            if not is_manager:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only this employee's manager or HR can submit the manager assessment.",
                )

        review.manager_assessment = manager_assessment
        review.rating = rating
        review.status = ReviewStatus.COMPLETED
        await self.reviews.save(review)
        await self.audit.log(requester.id, "manager_assessment_submit", "performance_review", str(review_id))
        return review
