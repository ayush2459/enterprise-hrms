from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.models.enums import JobOpeningStatus
from app.models.user import User
from app.schemas.recruitment import (
    CandidateConvertResponse,
    CandidateRead,
    CandidateStageUpdate,
    JobOpeningCreate,
    JobOpeningRead,
    JobOpeningStatusUpdate,
)
from app.services.recruitment_service import RecruitmentService

router = APIRouter(prefix="/recruitment", tags=["recruitment"])


@router.get("/openings", response_model=list[JobOpeningRead])
async def list_openings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RecruitmentService(db).list_openings()


@router.post("/openings", response_model=JobOpeningRead, status_code=201)
async def create_opening(
    payload: JobOpeningCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await RecruitmentService(db).create_opening(
        payload.title, payload.department, payload.positions_count, current_user
    )
    await db.commit()
    return result


@router.patch("/openings/{opening_id}/status", response_model=JobOpeningRead)
async def update_opening_status(
    opening_id: UUID,
    payload: JobOpeningStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await RecruitmentService(db).update_opening_status(opening_id, payload.status, current_user)
    await db.commit()
    return result


@router.get("/openings/{opening_id}/candidates", response_model=list[CandidateRead])
async def list_candidates(
    opening_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await RecruitmentService(db).list_candidates(opening_id)


@router.post("/openings/{opening_id}/candidates", response_model=CandidateRead, status_code=201)
async def add_candidate(
    opening_id: UUID,
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str | None = Form(None),
    resume: UploadFile | None = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await RecruitmentService(db).add_candidate(
        opening_id, full_name, email, phone, resume, current_user
    )
    await db.commit()
    return result


@router.patch("/candidates/{candidate_id}/stage", response_model=CandidateRead)
async def update_candidate_stage(
    candidate_id: UUID,
    payload: CandidateStageUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await RecruitmentService(db).update_stage(candidate_id, payload.stage, payload.notes, current_user)
    await db.commit()
    return result


@router.post("/candidates/{candidate_id}/convert", response_model=CandidateConvertResponse, status_code=201)
async def convert_candidate(
    candidate_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await RecruitmentService(db).convert_to_employee(candidate_id, current_user)
    await db.commit()
    return result


@router.get("/candidates/{candidate_id}/resume")
async def download_resume(
    candidate_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    candidate = await RecruitmentService(db).get_resume(candidate_id, current_user)
    return FileResponse(
        path=candidate.resume_file_path,
        filename=candidate.resume_file_name,
        media_type=candidate.resume_mime_type,
    )
