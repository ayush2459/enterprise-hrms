"""
Creates the very first System Admin user, for a brand-new database that
has no logins yet. There's no self-service signup in this app by design
(Section 3: accounts are provisioned by HR/Admin) — so the very first
account has to be created this way, once, outside the API.

Usage (inside the backend container):
    docker compose exec backend python scripts/create_admin.py
"""
import asyncio
import getpass
import sys

sys.path.insert(0, "/app")

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.enums import RoleEnum
from app.models.user import User


async def main():
    print("=== Create the first System Admin ===")
    email = input("Email: ").strip()
    if not email:
        print("Email is required.")
        return

    password = getpass.getpass("Password: ")
    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("Passwords do not match.")
        return
    if len(password) < 8:
        print("Password should be at least 8 characters.")
        return

    async with AsyncSessionLocal() as db:
        existing = await db.execute(select(User).where(User.official_email == email))
        if existing.scalar_one_or_none() is not None:
            print(f"A user with email {email} already exists.")
            return

        user = User(
            official_email=email,
            hashed_password=hash_password(password),
            role=RoleEnum.SYSTEM_ADMIN,
            is_active=True,
        )
        db.add(user)
        await db.commit()

    print(f"\nSystem Admin created: {email}")
    print("You can now log in at the frontend with this email and password.")


if __name__ == "__main__":
    asyncio.run(main())
