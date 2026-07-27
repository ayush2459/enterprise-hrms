from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.policy import PolicyAcknowledgementStatus, PolicyRead, PolicyReadWithAck
from app.services.policy_service import PolicyService

router = APIRouter(prefix="/policies", tags=["policies"])


@router.get("", response_model=list[PolicyReadWithAck])
async def list_policies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PolicyService(db).list_current_for_user(current_user)
    await db.commit()
    return result


@router.post("", response_model=PolicyRead, status_code=201)
async def publish_policy(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PolicyService(db).upload(title, category, file, current_user)
    await db.commit()
    return result


@router.post("/{policy_id}/acknowledge", status_code=204)
async def acknowledge_policy(
    policy_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await PolicyService(db).acknowledge(policy_id, current_user)
    await db.commit()


@router.get("/{policy_id}/download")
async def download_policy(
    policy_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    policy = await PolicyService(db).get_for_download(policy_id, current_user)
    await db.commit()
    return FileResponse(path=policy.file_path, filename=policy.file_name, media_type=policy.mime_type)


@router.get("/{policy_id}/compliance", response_model=list[PolicyAcknowledgementStatus])
async def get_policy_compliance(
    policy_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await PolicyService(db).get_compliance(policy_id, current_user)
    await db.commit()
    return result
