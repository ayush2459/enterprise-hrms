"""
Clears failed-login lockout state for a user (spec Section 7: account
lockout after 5 failed attempts). Useful after repeated testing trips
the lockout.

Usage (inside the backend container):
    python unlock_user.py --email admin@yourcompany.com
"""
import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.db.session import AsyncSessionLocal
from app.repositories.user_repository import UserRepository


async def unlock_user(email: str) -> None:
    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        user = await repo.get_by_email(email)
        if user is None:
            print(f"No user found with email {email}")
            return

        user.failed_login_attempts = 0
        user.locked_until = None
        await repo.save(user)
        await db.commit()
        print(f"Unlocked {email}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--email", required=True)
    args = parser.parse_args()
    asyncio.run(unlock_user(args.email))
