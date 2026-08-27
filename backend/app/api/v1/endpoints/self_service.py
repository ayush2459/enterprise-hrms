from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.auth.dependencies import get_current_user
from app.schemas.self_service import ApprovalDecision, NotificationOut
from app.repositories.notification_repository import NotificationRepository
from app.services.leave_approval_service import LeaveApprovalService
from app.services.user_employee_resolver import get_employee_for_user

router = APIRouter()


@router.get("/summary")
async def my_summary(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    employee = await get_employee_for_user(db, user)
    svc = LeaveApprovalService(db)
    requests = await svc.my_requests(employee.id)
    pending = sum(1 for r in requests if svc.overall_status(r) in ("pending_manager", "pending_hr"))

    return {
        "full_name": employee.full_name,
        "designation": employee.designation,
        "department": employee.department,
        "employee_code": user.employee_id,
        "employment_type": employee.employment_type,
        "status": str(employee.status),
        # TODO: wire once leave balance / attendance / payroll repos are shared
        "leave_balance_days": None,
        "active_leave_policies": None,
        "attendance_present": None,
        "attendance_leave": None,
        "attendance_absent": None,
        "latest_net_pay": None,
        "latest_net_pay_month": None,
        "pending_leave_requests": pending,
        "total_leave_requests": len(requests),
    }


@router.get("/leave-requests")
async def my_leave_requests(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    svc = LeaveApprovalService(db)
    requests = await svc.my_requests_for_user(user)
    return [
        {
            "id": r.id,
            "leave_type_id": r.leave_type_id,
            "start_date": str(r.start_date),
            "end_date": str(r.end_date),
            "reason": r.reason,
            "manager_status": r.manager_status,
            "hr_status": r.hr_status,
            "overall_status": svc.overall_status(r),
        }
        for r in requests
    ]


@router.post("/leave-requests/{leave_request_id}/manager-decision")
async def manager_decision(leave_request_id: int, decision: ApprovalDecision,
                            db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    svc = LeaveApprovalService(db)
    try:
        lr = await svc.manager_decide(leave_request_id, user.id, decision.approve, decision.comment)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {"id": lr.id, "manager_status": lr.manager_status}


@router.post("/leave-requests/{leave_request_id}/hr-decision")
async def hr_decision(leave_request_id: int, decision: ApprovalDecision,
                       db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    svc = LeaveApprovalService(db)
    try:
        lr = await svc.hr_decide(leave_request_id, user.id, decision.approve, decision.comment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"id": lr.id, "hr_status": lr.hr_status}


@router.get("/notifications", response_model=list[NotificationOut])
async def my_notifications(unread_only: bool = False, db: AsyncSession = Depends(get_db),
                            user=Depends(get_current_user)):
    repo = NotificationRepository(db)
    return await repo.list_for_user(user.id, unread_only=unread_only)


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: int, db: AsyncSession = Depends(get_db),
                                  user=Depends(get_current_user)):
    repo = NotificationRepository(db)
    await repo.mark_read(notification_id, user.id)
    return {"ok": True}
