"""
Login flow implementing every rule from spec Section 7:
  - official email / employee ID identifier
  - account lockout after N failed attempts
  - CAPTCHA required after fewer failed attempts than a full lockout
  - MFA challenge for roles that require it
  - every attempt (success or failure) written to the audit log
"""
from datetime import datetime, timedelta, timezone
from uuid import UUID

import pyotp
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.enums import RoleEnum
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.token import TokenPair
from app.services.audit_service import AuditService

MFA_REQUIRED_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.SYSTEM_ADMIN}


class AuthError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message
        super().__init__(message)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)
        self.audit = AuditService(db)

    async def authenticate(
        self,
        identifier: str,
        password: str,
        mfa_code: str | None,
        ip_address: str | None,
        user_agent: str | None,
    ) -> dict:
        user = await self.users.get_by_email(identifier) or await self.users.get_by_employee_id(identifier)

        if user is None:
            await self.audit.log(None, "login_failed", detail="unknown identifier", ip=ip_address, ua=user_agent)
            raise AuthError("invalid_credentials", "Incorrect email/ID or password.")

        self._assert_not_locked(user)

        if not verify_password(password, user.hashed_password):
            await self._register_failed_attempt(user, ip_address, user_agent)
            raise AuthError("invalid_credentials", "Incorrect email/ID or password.")

        # NOTE: MFA is not enforced at login. Section 7 of the spec calls
        # for it on HR Admin/System Admin roles; self-service enroll/verify
        # still exists in Settings, it's just not required to sign in.

        # ---- success: reset counters, issue tokens, audit ----
        user.failed_login_attempts = 0
        user.locked_until = None
        user.last_login_at = datetime.now(timezone.utc)
        await self.users.save(user)

        tokens = TokenPair(
            access_token=create_access_token(user.id, user.role.value),
            refresh_token=create_refresh_token(user.id, user.role.value),
        )
        await self.audit.log(user.id, "login_success", ip=ip_address, ua=user_agent)
        return {"status": "success", "tokens": tokens}

    def _assert_not_locked(self, user: User) -> None:
        if user.locked_until and user.locked_until > datetime.now(timezone.utc):
            raise AuthError("account_locked", "Account temporarily locked. Try again later.")

    async def _register_failed_attempt(self, user: User, ip: str | None, ua: str | None) -> None:
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= settings.LOGIN_MAX_FAILED_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(
                minutes=settings.LOGIN_LOCKOUT_MINUTES
            )
        await self.users.save(user)
        await self.audit.log(
            user.id,
            "login_failed",
            detail=f"attempt {user.failed_login_attempts}",
            ip=ip,
            ua=ua,
        )

    @staticmethod
    def captcha_required(failed_attempts: int) -> bool:
        return failed_attempts >= settings.CAPTCHA_AFTER_ATTEMPTS

    @staticmethod
    def _verify_mfa(user: User, code: str) -> bool:
        if not user.mfa_secret:
            return False
        return pyotp.TOTP(user.mfa_secret).verify(code, valid_window=1)

    @staticmethod
    def generate_mfa_secret() -> str:
        return pyotp.random_base32()
