from datetime import date, datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee
from app.models.user import User


class EmployeeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, employee_id: UUID) -> Employee | None:
        result = await self.db.execute(select(Employee).where(Employee.id == employee_id))
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: UUID) -> Employee | None:
        result = await self.db.execute(select(Employee).where(Employee.user_id == user_id))
        return result.scalar_one_or_none()

    async def list_all(self, skip: int = 0, limit: int = 50) -> list[Employee]:
        result = await self.db.execute(select(Employee).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def list_direct_reports(self, manager_employee_id: UUID) -> list[Employee]:
        result = await self.db.execute(
            select(Employee).where(Employee.reporting_manager_id == manager_employee_id)
        )
        return list(result.scalars().all())

    async def count_total(self) -> int:
        result = await self.db.execute(select(func.count()).select_from(Employee))
        return result.scalar_one()

    async def count_active_today(self) -> int:
        """Employees whose linked user logged in today (UTC)."""
        today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        result = await self.db.execute(
            select(func.count())
            .select_from(Employee)
            .join(User, User.id == Employee.user_id)
            .where(User.last_login_at >= today_start)
        )
        return result.scalar_one()

    async def count_new_joiners_since(self, since: date) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Employee).where(Employee.date_of_joining >= since)
        )
        return result.scalar_one()

    async def count_by_department(self) -> list[tuple[str, int]]:
        result = await self.db.execute(
            select(Employee.department, func.count())
            .group_by(Employee.department)
            .order_by(func.count().desc())
        )
        return [(dept or "Unassigned", count) for dept, count in result.all()]

    async def list_recent_joiners(self, limit: int = 5) -> list[Employee]:
        result = await self.db.execute(
            select(Employee)
            .where(Employee.date_of_joining.is_not(None))
            .order_by(Employee.date_of_joining.desc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def list_all_for_aggregation(self) -> list[Employee]:
        """Fetches every employee — used for in-Python aggregation (headcount
        trend, upcoming birthdays/anniversaries) where SQL date-part grouping
        would be more complex than the payoff justifies at this scale."""
        result = await self.db.execute(select(Employee))
        return list(result.scalars().all())

    async def create(self, employee: Employee) -> Employee:
        self.db.add(employee)
        await self.db.flush()
        await self.db.refresh(employee)
        return employee

    async def save(self, employee: Employee) -> Employee:
        await self.db.flush()
        await self.db.refresh(employee)
        return employee
