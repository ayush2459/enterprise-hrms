from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.bgv import BGVCheckCreate, BGVCheckRead, BGVCheckUpdate
from app.services.bgv_service import BGVService

router = APIRouter(prefix="/bgv", tags=["bgv"])


@router.get("/employee/{employee_id}", response_model=list[BGVCheckRead])
async def list_employee_checks(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await BGVService(db).list_for_employee(employee_id, current_user)
    await db.commit()
    return result


@router.post("/employee/{employee_id}", response_model=BGVCheckRead, status_code=201)
async def initiate_check(
    employee_id: UUID,
    payload: BGVCheckCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await BGVService(db).initiate(employee_id, payload.check_type, current_user)
    await db.commit()
    return result


@router.patch("/checks/{check_id}", response_model=BGVCheckRead)
async def update_check(
    check_id: UUID,
    payload: BGVCheckUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await BGVService(db).update_status(check_id, payload.status, payload.notes, current_user)
    await db.commit()
    return result
