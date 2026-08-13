import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.event import CompanyEventCreate, CompanyEventRead, CompanyEventUpdate
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


@router.patch("/{event_id}", response_model=CompanyEventRead)
async def update_event(
    event_id: uuid.UUID,
    payload: CompanyEventUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await EventService(db).update_event(
        event_id=event_id,
        title=payload.title,
        event_date=payload.event_date,
        category=payload.category,
    )

    if result is None:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.commit()
    await db.refresh(result)
    return result


@router.delete("/{event_id}", status_code=204)
async def delete_event(
    event_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    deleted = await EventService(db).delete_event(event_id)

    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.commit()
    return None
