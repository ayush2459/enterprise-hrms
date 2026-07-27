"""
Self-service account management: change password, and enroll/verify/
disable TOTP MFA. MFA is no longer enforced at login (see
auth_service.py) — this remains available for anyone who wants the
extra step voluntarily.
"""
import pyotp
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.services.audit_service import AuditService


class AccountService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)
        self.audit = AuditService(db)

    async def change_password(self, user: User, current_password: str, new_password: str) -> None:
        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Current password is incorrect.")
        if len(new_password) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 10 characters.",
            )
        user.hashed_password = hash_password(new_password)
        await self.users.save(user)
        await self.audit.log(user.id, "password_change")

    async def change_email(self, user: User, new_email: str, password: str) -> None:
        if not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password is incorrect.")

        existing = await self.users.get_by_email(new_email)
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT, detail="That email is already in use by another account."
            )

        old_email = user.official_email
        user.official_email = new_email
        await self.users.save(user)
        await self.audit.log(user.id, "email_change", detail=f"{old_email} -> {new_email}")

    async def setup_mfa(self, user: User) -> tuple[str, str]:
        secret = pyotp.random_base32()
        user.mfa_secret = secret
        await self.users.save(user)
        uri = pyotp.TOTP(secret).provisioning_uri(
            name=user.official_email, issuer_name=settings.MFA_ISSUER_NAME
        )
        await self.audit.log(user.id, "mfa_setup_started")
        return secret, uri

    async def verify_mfa(self, user: User, code: str) -> None:
        if not user.mfa_secret:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No MFA setup in progress. Call setup first.",
            )
        if not pyotp.TOTP(user.mfa_secret).verify(code, valid_window=1):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid code.")
        user.mfa_enabled = True
        await self.users.save(user)
        await self.audit.log(user.id, "mfa_enabled")

    async def disable_mfa(self, user: User, password: str) -> None:
        if not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Password is incorrect.")
        user.mfa_enabled = False
        user.mfa_secret = None
        await self.users.save(user)
        await self.audit.log(user.id, "mfa_disabled")
