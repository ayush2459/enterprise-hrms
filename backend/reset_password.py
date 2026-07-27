"""
Force-resets a user's password without needing the old one.

Usage (inside the backend container):
    python reset_password.py --email admin@yourcompany.com --password 'NewPass123'
"""
import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.core.security import hash_password
from app.db.session import AsyncSessionLocal
from app.repositories.user_repository import UserRepository


async def reset_password(email: str, new_password: str) -> None:
    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        user = await repo.get_by_email(email)
        if user is None:
            print(f"No user found with email {email}")
            return

        user.hashed_password = hash_password(new_password)
        user.failed_login_attempts = 0
        user.locked_until = None
        await repo.save(user)
        await db.commit()
        print(f"Password reset for {email}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()
    asyncio.run(reset_password(args.email, args.password))
