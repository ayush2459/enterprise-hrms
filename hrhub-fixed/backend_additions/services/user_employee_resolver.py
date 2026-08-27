from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.employee import Employee


async def get_employee_for_user(db: AsyncSession, user) -> Employee:
    """
    current_user (from get_current_user) is a User row, not an Employee row.
    Employee.user_id -> User.id is the link. Raises if no employee profile
    exists for this user (e.g. a pure-admin account with no employee record).
    """
    result = await db.execute(select(Employee).where(Employee.user_id == user.id))
    employee = result.scalar_one_or_none()
    if employee is None:
        raise ValueError(f"No employee profile found for user {user.id}")
    return employee
