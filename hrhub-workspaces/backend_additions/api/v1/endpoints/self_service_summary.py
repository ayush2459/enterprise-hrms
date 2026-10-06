"""
ADD THIS to your existing self_service.py router (from the earlier zip),
or copy as a new file and include it the same way. It assumes:
- Employee has: full_name (or similar), designation, department, employee_code
  or employee_id, employment_type, status
- LeaveType / leave balance data lives wherever your leave_service already
  computes it — adjust the placeholder calls below.
- PayrollRecord has employee_id, net_pay, month/period fields.

INTEGRATION: since these field names are still guesses (you haven't shared
employee.py, payroll_record.py, or attendance_record.py yet), this endpoint
returns a best-effort shape and will need field-name fixes once you share
those files. It's written so it degrades gracefully — missing pieces show
as null/0 in the UI instead of crashing.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.auth.dependencies import get_current_user
from app.models.employee import Employee
from app.services.leave_approval_service import LeaveApprovalService

router = APIRouter()


@router.get("/summary")
async def my_summary(db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    employee = await db.get(Employee, user.employee_id)
    svc = LeaveApprovalService(db)
    requests = await svc.my_requests(employee_id=user.employee_id)

    pending = sum(1 for r in requests if svc.overall_status(r) in ("pending_manager", "pending_hr"))

    return {
        "full_name": getattr(employee, "full_name", None) or getattr(employee, "official_email", "Employee"),
        "designation": getattr(employee, "designation", None),
        "department": getattr(employee, "department", None),
        "employee_code": getattr(employee, "employee_code", None) or getattr(employee, "employee_id", None),
        "employment_type": getattr(employee, "employment_type", None),
        "status": getattr(employee, "status", None),
        # TODO: wire to real leave-balance calc once leave_service exposes it
        "leave_balance_days": None,
        "active_leave_policies": None,
        # TODO: wire to attendance_repository aggregation
        "attendance_present": None,
        "attendance_leave": None,
        "attendance_absent": None,
        # TODO: wire to payroll_repository latest record
        "latest_net_pay": None,
        "latest_net_pay_month": None,
        "pending_leave_requests": pending,
        "total_leave_requests": len(requests),
    }
