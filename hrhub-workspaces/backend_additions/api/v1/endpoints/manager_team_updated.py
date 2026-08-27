"""
Replace the `my_team` and `pending_approvals` handlers in your manager.py
(from the earlier zip) with these versions — they return the extra fields
the new Manager Workspace UI needs (name, designation, department, status).

Field names (full_name, designation, department) are still guesses — fix
once you share employee.py.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.auth.dependencies import get_current_user
from app.auth.rbac import require_role
from app.services.manager_workspace_service import ManagerWorkspaceService

router = APIRouter(dependencies=[Depends(require_role("manager", "hr", "admin", "SYSTEM_ADMIN"))])


@router.get("/team")
async def my_team(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    svc = ManagerWorkspaceService(db)
    team = await svc.my_team(manager_employee_id=user.employee_id)
    return [
        {
            "id": e.id,
            "name": getattr(e, "full_name", None) or getattr(e, "official_email", "Employee"),
            "designation": getattr(e, "designation", None),
            "department": getattr(e, "department", None),
            "attendance_status": None,  # TODO: wire to today's attendance_record
        }
        for e in team
    ]


@router.get("/approvals/pending")
async def pending_approvals(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    svc = ManagerWorkspaceService(db)
    requests = await svc.pending_approvals(manager_employee_id=user.employee_id)
    out = []
    for r in requests:
        employee = await db.get(type(r).employee.property.mapper.class_, r.employee_id)
        out.append({
            "id": r.id,
            "employee_name": getattr(employee, "full_name", None) if employee else None,
            "leave_type": str(r.leave_type_id),  # TODO: join to leave_type name
            "start_date": str(r.start_date),
            "end_date": str(r.end_date),
        })
    return out
