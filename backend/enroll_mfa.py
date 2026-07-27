"""
Enrolls TOTP-based MFA for an existing user (spec Section 7). Prints the
secret + provisioning URI so you can add it to an authenticator app
(Google Authenticator, Authy, 1Password, etc.), and prints the
currently-valid 6-digit code so you can log in immediately without
waiting to scan anything.

Usage (inside the backend container):
    python enroll_mfa.py --email admin@yourcompany.com
"""
import argparse
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

import pyotp  # noqa: E402

from app.db.session import AsyncSessionLocal  # noqa: E402
from app.repositories.user_repository import UserRepository  # noqa: E402


async def enroll_mfa(email: str) -> None:
    async with AsyncSessionLocal() as db:
        repo = UserRepository(db)
        user = await repo.get_by_email(email)
        if user is None:
            print(f"No user found with email {email}")
            return

        secret = pyotp.random_base32()
        user.mfa_secret = secret
        user.mfa_enabled = True
        await repo.save(user)
        await db.commit()

        totp = pyotp.TOTP(secret)
        uri = totp.provisioning_uri(name=email, issuer_name="Enterprise HR Portal")

        print(f"MFA enrolled for {email}")
        print(f"Secret (manual entry): {secret}")
        print(f"Provisioning URI (scan or paste into an authenticator app):\n  {uri}")
        print(f"\nCurrent 6-digit code (valid ~30s, use this to log in right now):")
        print(f"  {totp.now()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Enroll MFA for an existing user")
    parser.add_argument("--email", required=True)
    args = parser.parse_args()

    asyncio.run(enroll_mfa(args.email))
