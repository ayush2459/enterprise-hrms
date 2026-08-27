"""
Role enforcement dependency.

INTEGRATION: Merge this into your existing backend/app/auth/rbac.py rather
than replacing it — you likely already have role-checking logic there.
This assumes your User model has a `.role` attribute with values among
"hr", "admin", "manager", "employee" (adjust the literal strings to match
whatever your app.models.enums actually defines).
"""
from fastapi import Depends, HTTPException, status

from app.auth.dependencies import get_current_user  # adjust import if named differently


def require_role(*allowed_roles: str):
    """Usage: Depends(require_role("manager", "hr"))"""
    def _check(user=Depends(get_current_user)):
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {', '.join(allowed_roles)}",
            )
        return user
    return _check


def require_manager_of(employee_id_param: str = "employee_id"):
    """
    Stricter check for manager-scoped routes: confirms the target employee
    actually reports to the requesting manager, not just that the user
    holds the 'manager' role. Wire this into endpoints that take an
    employee_id path/query param once you share employee.py's actual
    reporting-line field name.
    """
    raise NotImplementedError(
        "Fill in once employee.py's reporting-manager field name is confirmed."
    )
