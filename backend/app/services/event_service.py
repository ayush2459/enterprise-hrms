from sqlalchemy import select
"""
Company events (team outings, holidays, inductions, etc.) — HR-only to
create, visible to everyone since it's calendar-style org info, same
tier as the org chart.
"""
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.company_event import CompanyEvent
from app.models.enums import RoleEnum
from app.models.user import User
from app.repositories.company_event_repository import CompanyEventRepository
from app.services.audit_service import AuditService

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class EventService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.events = CompanyEventRepository(db)
        self.audit = AuditService(db)

    async def create_event(self, title: str, event_date, category: str, requester: User) -> CompanyEvent:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can add company events.",
            )
        event = CompanyEvent(title=title, event_date=event_date, category=category, created_by=requester.id)
        await self.events.create(event)
        await self.audit.log(requester.id, "company_event_create", "company_event", str(event.id))
        return event

    async def list_upcoming(self, within_days: int = 30) -> list[CompanyEvent]:
        return await self.events.list_upcoming(within_days)

    async def update_event(
        self,
        event_id,
        title=None,
        event_date=None,
        category=None,
    ):
        result = await self.db.execute(
            select(CompanyEvent).where(CompanyEvent.id == event_id)
        )
        event = result.scalar_one_or_none()

        if event is None:
            return None

        if title is not None:
            event.title = title

        if event_date is not None:
            event.event_date = event_date

        if category is not None:
            event.category = category

        return event

    async def delete_event(self, event_id):
        result = await self.db.execute(
            select(CompanyEvent).where(CompanyEvent.id == event_id)
        )
        event = result.scalar_one_or_none()

        if event is None:
            return False

        await self.db.delete(event)
        return True

