from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.holiday import HolidayCreate, HolidayRead
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
