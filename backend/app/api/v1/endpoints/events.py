from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.event import CompanyEventCreate, CompanyEventRead
from app.services.event_service import EventService

router = APIRouter(prefix="/events", tags=["events"])


@router.get("/upcoming", response_model=list[CompanyEventRead])
async def list_upcoming_events(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await EventService(db).list_upcoming()


@router.post("", response_model=CompanyEventRead, status_code=201)
async def create_event(
    payload: CompanyEventCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await EventService(db).create_event(payload.title, payload.event_date, payload.category, current_user)
    await db.commit()
    return result
