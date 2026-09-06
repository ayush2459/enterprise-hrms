import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.models.enums import RoleEnum
from app.models.user import User

TEST_PASSWORD = "Test@1234"

async def main():
    target = os.getenv("ADMIN_EMAIL", "").strip()
    async with AsyncSessionLocal() as db:
        query = select(User).where(User.role == RoleEnum.SYSTEM_ADMIN)
        if target:
            query = query.where(User.official_email == target)
        result = await db.execute(query)
        admins = result.scalars().all()
        if not admins:
            print("No matching System Admin account found.")
            return
        for admin in admins:
            admin.hashed_password = hash_password(TEST_PASSWORD)
            admin.failed_login_attempts = 0
            admin.locked_until = None
        await db.commit()
        for admin in admins:
            print("Reset System Admin password:", admin.official_email)

if __name__ == "__main__":
    asyncio.run(main())
