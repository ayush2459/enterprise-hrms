from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.account import (
    ChangeEmailRequest,
    ChangePasswordRequest,
    MFADisableRequest,
    MFASetupResponse,
    MFAVerifyRequest,
    MessageResponse,
)
from app.services.account_service import AccountService

router = APIRouter(prefix="/account", tags=["account"])


@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await AccountService(db).change_password(current_user, payload.current_password, payload.new_password)
    await db.commit()
    return MessageResponse(message="Password updated.")


@router.post("/change-email", response_model=MessageResponse)
async def change_email(
    payload: ChangeEmailRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await AccountService(db).change_email(current_user, payload.new_email, payload.password)
    await db.commit()
    return MessageResponse(message="Email updated.")


@router.post("/mfa/setup", response_model=MFASetupResponse)
async def setup_mfa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    secret, uri = await AccountService(db).setup_mfa(current_user)
    await db.commit()
    return MFASetupResponse(secret=secret, provisioning_uri=uri)


@router.post("/mfa/verify", response_model=MessageResponse)
async def verify_mfa(
    payload: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await AccountService(db).verify_mfa(current_user, payload.code)
    await db.commit()
    return MessageResponse(message="MFA enabled.")


@router.post("/mfa/disable", response_model=MessageResponse)
async def disable_mfa(
    payload: MFADisableRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await AccountService(db).disable_mfa(current_user, payload.password)
    await db.commit()
    return MessageResponse(message="MFA disabled.")
