"""
Creates two test accounts to exercise the role-based workspaces:
  - one Manager (role=reporting_manager)
  - one Employee (role=employee), reporting to that manager

Usage (inside the backend container):
    docker compose exec backend python scripts/create_test_workspace_accounts.py

Safe to re-run — skips any account whose email already exists.
"""

import asyncio
import sys

sys.path.insert(0, "/app")

from datetime import date

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.employee import Employee
from app.models.enums import EmploymentType, RoleEnum
from app.models.user import User

MANAGER_EMAIL = "manager@company.com"
MANAGER_PASSWORD = "Manager@123"
MANAGER_NAME = "Priya Manager"
MANAGER_EMPLOYEE_ID = "MGR-001"

EMPLOYEE_EMAIL = "employee@company.com"
EMPLOYEE_PASSWORD = "Employee@123"
EMPLOYEE_NAME = "Rahul Employee"
EMPLOYEE_EMPLOYEE_ID = "TEST-EMP-101"


async def get_or_create_user(db, email: str, password: str, role: RoleEnum, employee_id: str) -> User:
    existing = await db.execute(select(User).where(User.official_email == email))
    user = existing.scalar_one_or_none()
    if user is not None:
        print(f"User already exists, skipping: {email}")
        return user

    user = User(
        official_email=email,
        employee_id=employee_id,
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
    )
    db.add(user)
    await db.flush()
    print(f"Created user: {email} (role={role.value})")
    return user


async def get_or_create_employee(db, user: User, full_name: str, designation: str, manager_id=None) -> Employee:
    existing = await db.execute(select(Employee).where(Employee.user_id == user.id))
    employee = existing.scalar_one_or_none()
    if employee is not None:
        print(f"Employee profile already exists, skipping: {full_name}")
        return employee

    employee = Employee(
        user_id=user.id,
        full_name=full_name,
        department="Engineering",
        designation=designation,
        employment_type=EmploymentType.FULL_TIME,
        date_of_joining=date.today(),
        reporting_manager_id=manager_id,
    )
    db.add(employee)
    await db.flush()
    print(f"Created employee profile: {full_name}")
    return employee


async def main():
    async with AsyncSessionLocal() as db:
        manager_user = await get_or_create_user(
            db, MANAGER_EMAIL, MANAGER_PASSWORD, RoleEnum.REPORTING_MANAGER, MANAGER_EMPLOYEE_ID
        )
        manager_employee = await get_or_create_employee(
            db, manager_user, MANAGER_NAME, "Engineering Team Lead"
        )

        employee_user = await get_or_create_user(
            db, EMPLOYEE_EMAIL, EMPLOYEE_PASSWORD, RoleEnum.EMPLOYEE, EMPLOYEE_EMPLOYEE_ID
        )
        await get_or_create_employee(
            db, employee_user, EMPLOYEE_NAME, "Software Engineer", manager_id=manager_employee.id
        )

        await db.commit()

    print("\nDone. Test accounts:")
    print(f"  Manager  → {MANAGER_EMAIL} / {MANAGER_PASSWORD}")
    print(f"  Employee → {EMPLOYEE_EMAIL} / {EMPLOYEE_PASSWORD}  (reports to {MANAGER_NAME})")


if __name__ == "__main__":
    asyncio.run(main())
