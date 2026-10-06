"""
Sets up two REAL employees from your imported data as test accounts:
  - a Manager (by name match)
  - an Employee reporting to that manager (by name match)

Both get a known password set so you can log in and test each workspace.

Usage (inside the backend container):
    python set_manager_and_employee.py

Edit MANAGER_NAME_MATCH / EMPLOYEE_NAME_MATCH below if you want different
people — matching is case-insensitive substring search against full_name.
"""

import asyncio
import sys

sys.path.insert(0, "/app")

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.employee import Employee
from app.models.enums import RoleEnum
from app.models.user import User

MANAGER_NAME_MATCH = "Ayush"
MANAGER_PASSWORD = "Manager@123"

EMPLOYEE_NAME_MATCH = "Manu Jose"
EMPLOYEE_PASSWORD = "Employee@123"


async def find_employee_by_name(db, name_match: str) -> Employee | None:
    result = await db.execute(
        select(Employee).where(Employee.full_name.ilike(f"%{name_match}%"))
    )
    matches = result.scalars().all()
    if not matches:
        print(f"No employee found matching '{name_match}'")
        return None
    if len(matches) > 1:
        print(f"Multiple matches for '{name_match}', using the first one:")
        for m in matches:
            print(f"  - {m.full_name} ({m.id})")
    return matches[0]


async def promote(db, employee: Employee, role: RoleEnum, password: str, manager_id=None) -> None:
    user_result = await db.execute(select(User).where(User.id == employee.user_id))
    user = user_result.scalar_one()

    user.role = role
    user.hashed_password = hash_password(password)
    user.failed_login_attempts = 0
    user.locked_until = None

    if manager_id is not None:
        employee.reporting_manager_id = manager_id

    await db.flush()
    print(f"Updated {employee.full_name} ({user.official_email}) → role={role.value}, password={password}")


async def main():
    async with AsyncSessionLocal() as db:
        manager_employee = await find_employee_by_name(db, MANAGER_NAME_MATCH)
        if manager_employee is None:
            return
        await promote(db, manager_employee, RoleEnum.REPORTING_MANAGER, MANAGER_PASSWORD)

        employee = await find_employee_by_name(db, EMPLOYEE_NAME_MATCH)
        if employee is None:
            return
        await promote(db, employee, RoleEnum.EMPLOYEE, EMPLOYEE_PASSWORD, manager_id=manager_employee.id)

        await db.commit()

    print("\nDone — both accounts updated with the passwords shown above.")


if __name__ == "__main__":
    asyncio.run(main())
