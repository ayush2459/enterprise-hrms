from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.insurance import (
    DependentCreate,
    DependentRead,
    InsuranceFullRead,
    InsurancePolicyRead,
    InsurancePolicyUpsert,
)
from app.services.insurance_service import InsuranceService

router = APIRouter(prefix="/insurance", tags=["insurance"])


@router.get("/employee/{employee_id}", response_model=InsuranceFullRead)
async def get_insurance(
    employee_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await InsuranceService(db).get_for_employee(employee_id, current_user)
    await db.commit()
    return result


@router.put("/employee/{employee_id}/policy", response_model=InsurancePolicyRead)
async def upsert_policy(
    employee_id: UUID,
    payload: InsurancePolicyUpsert,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await InsuranceService(db).upsert_policy(employee_id, payload, current_user)
    await db.commit()
    return result


@router.post("/employee/{employee_id}/dependents", response_model=DependentRead, status_code=201)
async def add_dependent(
    employee_id: UUID,
    payload: DependentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await InsuranceService(db).add_dependent(employee_id, payload, current_user)
    await db.commit()
    return result


@router.patch("/dependents/{dependent_id}/verify", response_model=DependentRead)
async def verify_dependent(
    dependent_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await InsuranceService(db).verify_dependent(dependent_id, current_user)
    await db.commit()
    return result
