from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.asset import Asset
from app.models.user import User
from app.schemas.asset import AssetCreate
from app.services.audit_service import AuditService
from app.services.employee_service import FULL_ACCESS_ROLES


class AssetService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.audit = AuditService(db)

    async def list_for_employee(self, employee_id) -> list[Asset]:
        result = await self.db.execute(select(Asset).where(Asset.employee_id == employee_id))
        return list(result.scalars().all())

    async def assign(self, payload: AssetCreate, requester: User) -> Asset:
        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can assign assets.",
            )
        asset = Asset(**payload.model_dump())
        self.db.add(asset)
        await self.db.flush()
        await self.db.refresh(asset)
        await self.audit.log(requester.id, "asset_assign", "asset", str(asset.id))
        return asset

    async def mark_returned(self, asset: Asset, returned_date: date | None, requester: User) -> Asset:
        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can mark an asset returned.",
            )
        asset.returned_date = returned_date or date.today()
        await self.db.flush()
        await self.db.refresh(asset)
        await self.audit.log(requester.id, "asset_return", "asset", str(asset.id))
        return asset
