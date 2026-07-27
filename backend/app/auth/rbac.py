"""
Role-based access control, enforced server-side on every request —
never just hidden in the UI (spec Section 6 & Section 7).

Usage:
    @router.get("/", dependencies=[Depends(require_roles(RoleEnum.HR_ADMIN))])
"""
from fastapi import Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.models.enums import RoleEnum
from app.models.user import User

# Roles ranked from least to most privileged, mirrors Section 3's matrix.
ROLE_HIERARCHY: dict[RoleEnum, int] = {
    RoleEnum.EMPLOYEE: 0,
    RoleEnum.REPORTING_MANAGER: 1,
    RoleEnum.HR_EXECUTIVE: 2,
    RoleEnum.HR_ADMIN: 3,
    RoleEnum.SYSTEM_ADMIN: 3,  # parallel to HR_ADMIN, not a superset — see Section 3
}


def require_roles(*allowed_roles: RoleEnum):
    """Dependency factory: only the listed roles may call the endpoint."""

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user

    return dependency


def require_min_level(min_role: RoleEnum):
    """Dependency factory: caller's role must be >= min_role in the hierarchy."""

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if ROLE_HIERARCHY.get(current_user.role, -1) < ROLE_HIERARCHY.get(min_role, 99):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user

    return dependency
