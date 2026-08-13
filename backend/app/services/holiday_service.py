from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import extract, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.holiday import Holiday
from app.models.user import User
from app.schemas.holiday import HolidayCreate, HolidayUpdate
from app.services.audit_service import AuditService
from app.services.employee_service import FULL_ACCESS_ROLES


class HolidayService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.audit = AuditService(db)

    async def list_for_year(self, year: int) -> list[Holiday]:
        result = await self.db.execute(
            select(Holiday).where(extract("year", Holiday.date) == year).order_by(Holiday.date)
        )
        return list(result.scalars().all())

    async def create(self, payload: HolidayCreate, requester: User) -> Holiday:
        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can add holidays.",
            )
        holiday = Holiday(**payload.model_dump())
        self.db.add(holiday)
        await self.db.flush()
        await self.db.refresh(holiday)
        await self.audit.log(requester.id, "holiday_add", "holiday", str(holiday.id))
        return holiday


    async def update(
        self,
        holiday_id: UUID,
        payload: HolidayUpdate,
        requester: User,
    ) -> Holiday | None:
        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can edit holidays.",
            )

        result = await self.db.execute(
            select(Holiday).where(Holiday.id == holiday_id)
        )
        holiday = result.scalar_one_or_none()

        if holiday is None:
            return None

        holiday.name = payload.name
        holiday.date = payload.date
        holiday.is_optional = payload.is_optional

        await self.db.flush()
        await self.db.refresh(holiday)

        await self.audit.log(
            requester.id,
            "holiday_update",
            "holiday",
            str(holiday.id),
        )

        return holiday

    async def delete(
        self,
        holiday_id: UUID,
        requester: User,
    ) -> bool:
        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can delete holidays.",
            )

        result = await self.db.execute(
            select(Holiday).where(Holiday.id == holiday_id)
        )
        holiday = result.scalar_one_or_none()

        if holiday is None:
            return False

        await self.db.delete(holiday)
        await self.db.flush()

        await self.audit.log(
            requester.id,
            "holiday_delete",
            "holiday",
            str(holiday.id),
        )

        return True
