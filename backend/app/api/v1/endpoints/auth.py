from app.core.config import settings
from app.core.redis import redis_client
import secrets
from urllib.parse import urlencode
from fastapi.responses import RedirectResponse
from authlib.integrations.httpx_client import AsyncOAuth2Client
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.core.security import create_access_token, decode_token, create_refresh_token, hash_password
from app.db.session import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.token import LoginRequest, LoginResponse, RefreshRequest, TokenPair
from app.schemas.user import UserRead
from app.services.auth_service import AuthError, AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_OAUTH_STATE_PREFIX = "hrms:google:state:"
GOOGLE_LOGIN_CODE_PREFIX = "hrms:google:login:"



@router.get("/google")
async def google_login():
    state = secrets.token_urlsafe(32)

    await redis_client.set(
        f"{GOOGLE_OAUTH_STATE_PREFIX}{state}",
        "1",
        ex=600,
    )

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "select_account",
    }

    return RedirectResponse(
        url=f"{GOOGLE_AUTH_URL}?{urlencode(params)}"
    )


@router.get("/google/callback")
async def google_callback(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Google authentication response",
        )

    state_key = f"{GOOGLE_OAUTH_STATE_PREFIX}{state}"
    state_exists = await redis_client.get(state_key)

    if not state_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired Google authentication state",
        )

    await redis_client.delete(state_key)

    async with AsyncOAuth2Client(
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
    ) as client:
        token = await client.fetch_token(
            GOOGLE_TOKEN_URL,
            code=code,
            redirect_uri=settings.GOOGLE_REDIRECT_URI,
        )

        access_token = token.get("access_token")

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to obtain Google access token",
            )

        response = await client.get(
            GOOGLE_USERINFO_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
            },
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to verify Google account",
            )

        google_user = response.json()

    google_email = google_user.get("email")
    email_verified = google_user.get("email_verified", False)

    print(f"Google verified email: {google_email}")

    if not google_email or not email_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account email is not verified",
        )

    user = await UserRepository(db).get_by_email(google_email.lower())

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your Google account is not registered in HR Portal",
        )

    login_code = secrets.token_urlsafe(32)

    await redis_client.set(
        f"{GOOGLE_LOGIN_CODE_PREFIX}{login_code}",
        str(user.id),
        ex=60,
    )

    redirect_url = (
        f"{settings.GOOGLE_FRONTEND_URL.rstrip('/')}/login?"
        + urlencode({"google_code": login_code})
    )

    return RedirectResponse(url=redirect_url)



@router.post("/google/exchange", response_model=LoginResponse)
async def google_exchange(
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    google_code = payload.get("google_code")

    if not google_code:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Google login code is required",
        )
    code_key = f"{GOOGLE_LOGIN_CODE_PREFIX}{google_code}"
    user_id = await redis_client.get(code_key)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google login code",
        )

    # Make the code single-use.
    await redis_client.delete(code_key)

    user = await UserRepository(db).get_by_id(user_id)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid HR Portal account",
        )

    tokens = TokenPair(
        access_token=create_access_token(user.id, user.role.value),
        refresh_token=create_refresh_token(user.id, user.role.value),
    )

    return LoginResponse(
        status="success",
        tokens=tokens,
    )


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    try:
        result = await service.authenticate(
            identifier=payload.identifier,
            password=payload.password,
            mfa_code=payload.mfa_code,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )
        await db.commit()
    except AuthError as exc:
        await db.commit()  # persist the failed-attempt counter even on error
        status_code = (
            status.HTTP_423_LOCKED
            if exc.code == "account_locked"
            else status.HTTP_401_UNAUTHORIZED
        )
        raise HTTPException(status_code=status_code, detail=exc.message) from exc

    return LoginResponse(**result)


@router.post("/reset-password")
async def reset_password(
    payload: dict,
    db: AsyncSession = Depends(get_db),
):
    identifier = (payload.get("identifier") or "").strip()
    new_password = payload.get("new_password") or ""
    confirm_password = payload.get("confirm_password") or ""

    if not identifier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or official email is required",
        )

    if not new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password is required",
        )

    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long",
        )

    if new_password != confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match",
        )

    users = UserRepository(db)

    user = await users.get_by_email(identifier)

    if user is None:
        user = await users.get_by_employee_id(identifier)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found",
        )

    user.hashed_password = hash_password(new_password)

    # Reset authentication lockout state as part of password recovery.
    user.failed_login_attempts = 0
    user.locked_until = None

    await users.save(user)
    await db.commit()

    return {
        "status": "success",
        "message": "Password updated successfully",
    }


@router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshRequest, db: AsyncSession = Depends(get_db)):
    data = decode_token(payload.refresh_token)
    if data is None or data.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = await UserRepository(db).get_by_id(data["sub"])
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    new_access = create_access_token(user.id, user.role.value)
    return TokenPair(access_token=new_access, refresh_token=payload.refresh_token)


@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user
