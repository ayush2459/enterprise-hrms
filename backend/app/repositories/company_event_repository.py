from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company_event import CompanyEvent


class CompanyEventRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, event: CompanyEvent) -> CompanyEvent:
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(event)
        return event

    async def list_upcoming(self, within_days: int = 30) -> list[CompanyEvent]:
        today = date.today()
        window_end = today + timedelta(days=within_days)
        result = await self.db.execute(
            select(CompanyEvent)
            .where(CompanyEvent.event_date >= today, CompanyEvent.event_date <= window_end)
            .order_by(CompanyEvent.event_date)
        )
        return list(result.scalars().all())
