"""
FastAPI dependency that resolves the current authenticated user from the
Authorization header on every request (spec Section 7: JWT-based session
authentication + role-based access re-validation).
"""
from uuid import UUID

from fastapi import Depends, HTTPException, WebSocket, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_token
from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

CREDENTIALS_EXCEPTION = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        raise CREDENTIALS_EXCEPTION

    user_id = payload.get("sub")
    if user_id is None:
        raise CREDENTIALS_EXCEPTION

    user = await UserRepository(db).get_by_id(UUID(user_id))
    if user is None or not user.is_active:
        raise CREDENTIALS_EXCEPTION

    # Re-validate role on every request: a token minted before a role
    # change should not keep the old privileges (Section 6).
    if user.role.value != payload.get("role"):
        raise CREDENTIALS_EXCEPTION

    return user


async def get_current_user_ws(
    websocket,
    token: str | None = None,
    db: AsyncSession = Depends(get_db),
) -> User:
    """WS-compatible variant of get_current_user. Browsers can't send
    Authorization headers on a WebSocket handshake, so the frontend
    passes the JWT as a ?token= query param instead."""
    if token is None:
        await websocket.close(code=4401)
        raise CREDENTIALS_EXCEPTION

    payload = decode_token(token)
    if payload is None or payload.get("type") != "access":
        await websocket.close(code=4401)
        raise CREDENTIALS_EXCEPTION

    user_id = payload.get("sub")
    if user_id is None:
        await websocket.close(code=4401)
        raise CREDENTIALS_EXCEPTION

    user = await UserRepository(db).get_by_id(UUID(user_id))
    if user is None or not user.is_active:
        await websocket.close(code=4401)
        raise CREDENTIALS_EXCEPTION

    return user
