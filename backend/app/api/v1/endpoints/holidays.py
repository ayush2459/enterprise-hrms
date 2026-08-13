from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.holiday import HolidayCreate, HolidayRead, HolidayUpdate
from app.services.holiday_service import HolidayService

router = APIRouter(prefix="/holidays", tags=["holidays"])


@router.get("", response_model=list[HolidayRead])
async def list_holidays(
    year: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await HolidayService(db).list_for_year(year or date.today().year)


@router.post("", response_model=HolidayRead, status_code=status.HTTP_201_CREATED)
async def add_holiday(
    payload: HolidayCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await HolidayService(db).create(payload, current_user)
    await db.commit()
    return result


@router.patch("/{holiday_id}", response_model=HolidayRead)
async def update_holiday(
    holiday_id: UUID,
    payload: HolidayUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    holiday = await HolidayService(db).update(holiday_id, payload, current_user)
    if holiday is None:
        raise HTTPException(status_code=404, detail="Holiday not found")
    await db.commit()
    return holiday


@router.delete("/{holiday_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_holiday(
    holiday_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await HolidayService(db).delete(holiday_id, current_user)
    if not deleted:
        raise HTTPException(status_code=404, detail="Holiday not found")
    await db.commit()
