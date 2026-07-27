from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.attendance import AttendanceMarkRequest, AttendanceRecordRead, AttendanceSummary
from app.services.attendance_service import AttendanceService

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("/employee/{employee_id}", response_model=list[AttendanceRecordRead])
async def list_attendance(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService(db).list_for_employee(employee_id, current_user)


@router.get("/employee/{employee_id}/summary", response_model=AttendanceSummary)
async def get_attendance_summary(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AttendanceService(db).get_summary(employee_id, current_user)


@router.post("/employee/{employee_id}", response_model=AttendanceRecordRead, status_code=201)
async def mark_attendance(
    employee_id: UUID,
    payload: AttendanceMarkRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await AttendanceService(db).mark(employee_id, payload.date, payload.status, current_user)
    await db.commit()
    return result
