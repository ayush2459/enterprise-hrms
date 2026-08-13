from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.payroll import PayrollRecordCreate, PayrollRecordRead, PayrollRecordUpdate, PayrollStatusUpdate
from app.services.payroll_service import PayrollService

router = APIRouter(prefix="/payroll", tags=["payroll"])


@router.get("/employee/{employee_id}", response_model=list[PayrollRecordRead])
async def list_payroll(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PayrollService(db).list_for_employee(employee_id, current_user)
    await db.commit()
    return result


@router.post("/employee/{employee_id}", response_model=PayrollRecordRead, status_code=201)
async def create_payroll_record(
    employee_id: UUID,
    payload: PayrollRecordCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PayrollService(db).create_record(
        employee_id, payload.month, payload.basic_pay, payload.allowances, payload.deductions, current_user
    )
    await db.commit()
    return result


@router.patch("/{record_id}", response_model=PayrollRecordRead)
async def update_payroll_record(
    record_id: UUID,
    payload: PayrollRecordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PayrollService(db).update_record(
        record_id,
        payload.month,
        payload.basic_pay,
        payload.allowances,
        payload.deductions,
        current_user,
    )
    await db.commit()
    return result


@router.patch("/{record_id}/status", response_model=PayrollRecordRead)
async def update_payroll_status(
    record_id: UUID,
    payload: PayrollStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PayrollService(db).update_status(record_id, payload.status, current_user)
    await db.commit()
    return result
