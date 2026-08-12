"""
Automatically creates the first System Admin from environment variables.

Required:
    ADMIN_EMAIL
    ADMIN_PASSWORD
"""

import asyncio
import os
import sys

sys.path.insert(0, "/app")

from sqlalchemy import select
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.enums import RoleEnum
from app.models.user import User


async def main():
    email = os.getenv("ADMIN_EMAIL", "").strip()
    password = os.getenv("ADMIN_PASSWORD", "")

    if not email:
        print("ADMIN_EMAIL is not set. Skipping admin creation.")
        return

    if not password:
        print("ADMIN_PASSWORD is not set. Skipping admin creation.")
        return

    if len(password) < 8:
        print("ADMIN_PASSWORD must be at least 8 characters.")
        return

    async with AsyncSessionLocal() as db:
        existing = await db.execute(
            select(User).where(User.official_email == email)
        )

        if existing.scalar_one_or_none() is not None:
            print(f"System Admin already exists: {email}")
            return

        user = User(
            official_email=email,
            hashed_password=hash_password(password),
            role=RoleEnum.SYSTEM_ADMIN,
            is_active=True,
        )

        db.add(user)
        await db.commit()

    print(f"System Admin automatically created: {email}")


if __name__ == "__main__":
    asyncio.run(main())
