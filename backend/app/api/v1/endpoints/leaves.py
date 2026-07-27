from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.leave import (
    LeaveBalance,
    LeaveRequestCreate,
    LeaveRequestDecision,
    LeaveRequestRead,
    LeaveTypeCreate,
    LeaveTypeRead,
)
from app.services.leave_service import LeaveService

router = APIRouter(prefix="/leaves", tags=["leaves"])


@router.get("/types", response_model=list[LeaveTypeRead])
async def list_leave_types(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LeaveService(db).list_leave_types()


@router.post("/types", response_model=LeaveTypeRead, status_code=201)
async def create_leave_type(
    payload: LeaveTypeCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await LeaveService(db).create_leave_type(payload.name, payload.annual_quota_days, current_user)
    await db.commit()
    return result


@router.get("/employee/{employee_id}", response_model=list[LeaveRequestRead])
async def list_leave_requests(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LeaveService(db).list_for_employee(employee_id, current_user)


@router.get("/employee/{employee_id}/balance", response_model=list[LeaveBalance])
async def get_leave_balance(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await LeaveService(db).get_balances(employee_id, current_user)


@router.post("/employee/{employee_id}", response_model=LeaveRequestRead, status_code=201)
async def apply_for_leave(
    employee_id: UUID,
    payload: LeaveRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await LeaveService(db).apply(
        employee_id, payload.leave_type_id, payload.start_date, payload.end_date, payload.reason, current_user
    )
    await db.commit()
    return result


@router.patch("/{request_id}/decision", response_model=LeaveRequestRead)
async def decide_leave_request(
    request_id: UUID,
    payload: LeaveRequestDecision,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await LeaveService(db).decide(request_id, payload.status, current_user)
    await db.commit()
    return result
