from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.leave_request import LeaveRequest
from app.services.user_employee_resolver import get_employee_for_user


class ManagerWorkspaceService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def my_team_for_user(self, db_user) -> list[Employee]:
        manager_employee = await get_employee_for_user(self.db, db_user)
        return await self.my_team(manager_employee.id)

    async def my_team(self, manager_employee_id) -> list[Employee]:
        stmt = select(Employee).where(Employee.reporting_manager_id == manager_employee_id)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def pending_approvals_for_user(self, db_user) -> list[LeaveRequest]:
        manager_employee = await get_employee_for_user(self.db, db_user)
        return await self.pending_approvals(manager_employee.id)

    async def pending_approvals(self, manager_employee_id) -> list[LeaveRequest]:
        team_ids_stmt = select(Employee.id).where(Employee.reporting_manager_id == manager_employee_id)
        stmt = (
            select(LeaveRequest)
            .where(LeaveRequest.employee_id.in_(team_ids_stmt))
            .where(LeaveRequest.manager_status == "pending")
            .order_by(LeaveRequest.id.desc())
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())
