from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.auth.dependencies import get_current_user
from app.auth.rbac import require_role
from app.schemas.self_service import ApprovalDecision
from app.services.manager_workspace_service import ManagerWorkspaceService
from app.services.leave_approval_service import LeaveApprovalService
from app.models.employee import Employee

router = APIRouter(dependencies=[Depends(require_role("manager", "hr", "admin", "SYSTEM_ADMIN"))])


@router.get("/team")
async def my_team(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    svc = ManagerWorkspaceService(db)
    team = await svc.my_team_for_user(user)
    return [
        {
            "id": e.id,
            "name": e.full_name,
            "designation": e.designation,
            "department": e.department,
            "attendance_status": None,  # TODO: wire to today's attendance_record
        }
        for e in team
    ]


@router.get("/approvals/pending")
async def pending_approvals(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    svc = ManagerWorkspaceService(db)
    requests = await svc.pending_approvals_for_user(user)
    out = []
    for r in requests:
        employee = await db.get(Employee, r.employee_id)
        out.append({
            "id": r.id,
            "employee_name": employee.full_name if employee else None,
            "leave_type": str(r.leave_type_id),  # TODO: join to leave_type name once shared
            "start_date": str(r.start_date),
            "end_date": str(r.end_date),
        })
    return out


@router.post("/approvals/{leave_request_id}/decision")
async def decide(leave_request_id: int, decision: ApprovalDecision,
                  db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    # NOTE: does not yet verify leave_request_id belongs to this manager's
    # own team before approving — add that check once volume of use justifies it.
    svc = LeaveApprovalService(db)
    try:
        lr = await svc.manager_decide(leave_request_id, user.id, decision.approve, decision.comment)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"id": lr.id, "manager_status": lr.manager_status}
