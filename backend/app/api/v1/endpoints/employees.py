from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.rbac import require_roles
from app.db.session import get_db
from app.models.enums import RoleEnum
from app.models.user import User
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.employee import (
    ConversionDecisionRequest,
    EmployeeCreateRequest,
    EmployeeCreateResponse,
    EmployeeReadFull,
    EmployeeReadPublic,
    EmployeeStats,
    EmployeeUpdate,
    OffboardRequest,
    SeparatedEmployee,
)
from app.services.employee_service import EmployeeService

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=list[EmployeeReadPublic])
async def list_employees(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Directory view — every authenticated role can see the public
    fields. Only currently active employees show up here; anyone marked
    resigned/terminated is excluded (see /separated for that list)."""
    return await EmployeeService(db).list_directory(skip, limit)


@router.get("/offboarded", response_model=list[SeparatedEmployee])
async def list_offboarded_employees(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Everyone who has resigned or been terminated — the 'former
    employees' list. Registered before /{employee_id} so it doesn't get
    swallowed by the dynamic route."""
    return await EmployeeService(db).list_offboarded(skip, limit)


@router.get("/stats/summary", response_model=EmployeeStats)
async def get_employee_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Dashboard KPI numbers. Registered before /{employee_id} so it
    doesn't get swallowed by the dynamic route."""
    return await EmployeeService(db).get_stats()


@router.post(
    "",
    response_model=EmployeeCreateResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles(RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN))],
)
async def create_employee(
    payload: EmployeeCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await EmployeeService(db).create_employee(payload, current_user)
    await db.commit()
    return result


@router.get("/{employee_id}", response_model=EmployeeReadFull | EmployeeReadPublic)
async def get_employee(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    employee = await EmployeeRepository(db).get_by_id(employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    result = await EmployeeService(db).get_visible_profile(employee, current_user)
    await db.commit()
    return result


@router.patch("/{employee_id}", response_model=EmployeeReadFull)
async def update_employee(
    employee_id: UUID,
    payload: EmployeeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    employee = await EmployeeRepository(db).get_by_id(employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    updated = await EmployeeService(db).update_employee(employee, payload, current_user)
    await db.commit()
    return updated


@router.post("/{employee_id}/conversion/request", response_model=EmployeeReadFull | EmployeeReadPublic)
async def request_conversion(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """An intern (or HR on their behalf) requests conversion to full-time."""
    employee = await EmployeeRepository(db).get_by_id(employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    updated = await EmployeeService(db).request_conversion(employee, current_user)
    result = await EmployeeService(db).get_visible_profile(updated, current_user)
    await db.commit()
    return result


@router.post("/{employee_id}/conversion/decide", response_model=EmployeeReadFull | EmployeeReadPublic)
async def decide_conversion(
    employee_id: UUID,
    payload: ConversionDecisionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """The reporting manager (or HR/System Admin) approves or rejects a
    pending conversion request — 'team approval' turns the intern into a
    full-time employee immediately."""
    employee = await EmployeeRepository(db).get_by_id(employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    updated = await EmployeeService(db).decide_conversion(employee, payload.approve, current_user)
    result = await EmployeeService(db).get_visible_profile(updated, current_user)
    await db.commit()
    return result


@router.post(
    "/{employee_id}/offboard",
    response_model=EmployeeReadFull,
    dependencies=[Depends(require_roles(RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN))],
)
async def offboard_employee(
    employee_id: UUID,
    payload: OffboardRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark an employee as resigned or terminated. Removes them from the
    active directory and dashboard, and revokes their login."""
    employee = await EmployeeRepository(db).get_by_id(employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    updated = await EmployeeService(db).offboard_employee(employee, payload.reason, current_user)
    await db.commit()
    return EmployeeReadFull.model_validate(updated)


@router.post(
    "/{employee_id}/reactivate",
    response_model=EmployeeReadFull,
    dependencies=[Depends(require_roles(RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN))],
)
async def reactivate_employee(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Undo a resigned/terminated marking — brings the employee back onto
    the active roster and restores their login."""
    employee = await EmployeeRepository(db).get_by_id(employee_id)
    if employee is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    updated = await EmployeeService(db).reactivate_employee(employee, current_user)
    await db.commit()
    return EmployeeReadFull.model_validate(updated)
