from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.asset import Asset
from app.models.user import User
from app.schemas.asset import AssetCreate, AssetRead, AssetReturnRequest
from app.services.asset_service import AssetService

router = APIRouter(prefix="/assets", tags=["assets"])


@router.get("/employee/{employee_id}", response_model=list[AssetRead])
async def list_employee_assets(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await AssetService(db).list_for_employee(employee_id)


@router.post("", response_model=AssetRead, status_code=status.HTTP_201_CREATED)
async def assign_asset(
    payload: AssetCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await AssetService(db).assign(payload, current_user)
    await db.commit()
    return result


@router.post("/{asset_id}/return", response_model=AssetRead)
async def return_asset(
    asset_id: UUID,
    payload: AssetReturnRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Asset).where(Asset.id == asset_id))
    asset = result.scalar_one_or_none()
    if asset is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")

    updated = await AssetService(db).mark_returned(asset, payload.returned_date, current_user)
    await db.commit()
    return updated
