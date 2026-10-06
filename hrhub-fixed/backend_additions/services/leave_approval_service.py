from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.leave_request import LeaveRequest
from app.models.employee import Employee
from app.repositories.notification_repository import NotificationRepository
from app.services.user_employee_resolver import get_employee_for_user


class LeaveApprovalService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.notifications = NotificationRepository(db)

    def overall_status(self, lr: LeaveRequest) -> str:
        if lr.manager_status == "rejected" or lr.hr_status == "rejected":
            return "rejected"
        if lr.manager_status != "approved":
            return "pending_manager"
        if lr.hr_status != "approved":
            return "pending_hr"
        return "approved"

    async def submit_for_user(self, db_user, leave_type_id: int, start_date, end_date, reason: str | None) -> LeaveRequest:
        employee = await get_employee_for_user(self.db, db_user)
        return await self.submit(employee.id, leave_type_id, start_date, end_date, reason)

    async def submit(self, employee_id, leave_type_id: int, start_date, end_date, reason: str | None) -> LeaveRequest:
        lr = LeaveRequest(
            employee_id=employee_id,
            leave_type_id=leave_type_id,
            start_date=start_date,
            end_date=end_date,
            reason=reason,
            manager_status="pending",
            hr_status="pending",
        )
        self.db.add(lr)
        await self.db.commit()
        await self.db.refresh(lr)

        employee = await self.db.get(Employee, employee_id)
        if employee and employee.reporting_manager_id:
            manager = await self.db.get(Employee, employee.reporting_manager_id)
            if manager:
                await self.notifications.create(
                    user_id=manager.user_id,
                    title="New leave request awaiting your approval",
                    body=f"{employee.full_name} requested leave.",
                    category="leave_approval",
                    reference_type="leave_request",
                    reference_id=lr.id,
                )
        return lr

    async def manager_decide(self, leave_request_id: int, manager_user_id, approve: bool, comment: str | None) -> LeaveRequest:
        lr = await self.db.get(LeaveRequest, leave_request_id)
        if lr is None:
            raise ValueError("Leave request not found")

        lr.manager_status = "approved" if approve else "rejected"
        lr.manager_decided_by = manager_user_id
        lr.manager_decided_at = datetime.now(timezone.utc)
        lr.manager_comment = comment
        await self.db.commit()
        await self.db.refresh(lr)

        employee = await self.db.get(Employee, lr.employee_id)
        title = "Your leave request was approved by your manager" if approve else "Your leave request was rejected by your manager"
        await self.notifications.create(
            user_id=employee.user_id,
            title=title,
            body=comment,
            category="leave_approval",
            reference_type="leave_request",
            reference_id=lr.id,
        )

        if approve:
            # TODO: replace user_id=0 with real HR broadcast once you decide
            # how HR users are identified (a role query on `users`, most likely).
            await self.notifications.create(
                user_id=0,
                title="Leave request needs HR sign-off",
                body=None,
                category="leave_approval",
                reference_type="leave_request",
                reference_id=lr.id,
            )
        return lr

    async def hr_decide(self, leave_request_id: int, hr_user_id, approve: bool, comment: str | None) -> LeaveRequest:
        lr = await self.db.get(LeaveRequest, leave_request_id)
        if lr is None:
            raise ValueError("Leave request not found")
        if lr.manager_status != "approved":
            raise ValueError("Cannot HR-approve before manager approval")

        lr.hr_status = "approved" if approve else "rejected"
        lr.hr_decided_by = hr_user_id
        lr.hr_decided_at = datetime.now(timezone.utc)
        lr.hr_comment = comment
        await self.db.commit()
        await self.db.refresh(lr)

        employee = await self.db.get(Employee, lr.employee_id)
        title = "Your leave request was fully approved" if approve else "Your leave request was rejected by HR"
        await self.notifications.create(
            user_id=employee.user_id,
            title=title,
            body=comment,
            category="leave_approval",
            reference_type="leave_request",
            reference_id=lr.id,
        )
        return lr

    async def my_requests_for_user(self, db_user) -> list[LeaveRequest]:
        employee = await get_employee_for_user(self.db, db_user)
        return await self.my_requests(employee.id)

    async def my_requests(self, employee_id) -> list[LeaveRequest]:
        stmt = select(LeaveRequest).where(LeaveRequest.employee_id == employee_id).order_by(LeaveRequest.id.desc())
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
