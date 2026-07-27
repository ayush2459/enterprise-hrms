"""
Creates the first System Admin account. Run once, after Alembic
migrations, inside the backend container:

    docker compose exec backend python /app/../scripts/create_admin.py \
        --email admin@yourcompany.com --password "ChangeMe123!"

(Adjust the path if running outside Docker — this script imports from the
`backend/app` package, so it expects `backend/` on PYTHONPATH.)
"""
import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.core.security import hash_password  # noqa: E402
from app.db.session import AsyncSessionLocal  # noqa: E402
from app.models.enums import RoleEnum  # noqa: E402
from app.models.user import User  # noqa: E402
from app.repositories.user_repository import UserRepository  # noqa: E402


async def create_admin(email: str, password: str) -> None:
    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        existing = await repo.get_by_email(email)
        if existing:
            print(f"User {email} already exists — aborting.")
            return

        admin = User(
            official_email=email,
            hashed_password=hash_password(password),
            role=RoleEnum.SYSTEM_ADMIN,
            is_active=True,
        )
        await repo.create(admin)
        await db.commit()
        print(f"System Admin created: {email}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create the first System Admin user")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    asyncio.run(create_admin(args.email, args.password))
