"""
Recruitment pipeline: job openings, candidates, and the hand-off into
Onboarding once a candidate is hired. Converting a candidate reuses
EmployeeService.create_employee — the same User+Employee creation path
as adding an employee directly — so there's exactly one place that
logic lives.
"""
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.candidate import Candidate
from app.models.enums import CandidateStage, EmploymentType, RoleEnum, SelectionStatus
from app.models.job_opening import JobOpening
from app.models.user import User
from app.repositories.candidate_repository import CandidateRepository
from app.repositories.job_opening_repository import JobOpeningRepository
from app.schemas.employee import EmployeeCreateRequest
from app.schemas.recruitment import CandidateConvertResponse
from app.services.audit_service import AuditService
from app.services.employee_service import EmployeeService
from app.utils.file_storage import save_upload

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


def _require_hr(requester: User) -> None:
    if requester.role not in HR_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only HR Admin, HR Executive, or System Admin can manage recruitment.",
        )


class RecruitmentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.openings = JobOpeningRepository(db)
        self.candidates = CandidateRepository(db)
        self.audit = AuditService(db)

    async def list_openings(self) -> list[JobOpening]:
        return await self.openings.list_all()

    async def create_opening(self, title: str, department: str, positions_count: int, requester: User) -> JobOpening:
        _require_hr(requester)
        opening = JobOpening(
            title=title, department=department, positions_count=positions_count, created_by=requester.id
        )
        await self.openings.create(opening)
        await self.audit.log(requester.id, "job_opening_create", "job_opening", str(opening.id))
        return opening

    async def update_opening_status(self, opening_id: uuid.UUID, new_status, requester: User) -> JobOpening:
        _require_hr(requester)
        opening = await self.openings.get_by_id(opening_id)
        if opening is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found")
        opening.status = new_status
        await self.openings.save(opening)
        await self.audit.log(requester.id, "job_opening_status_update", "job_opening", str(opening_id))
        return opening

    async def list_candidates(self, opening_id: uuid.UUID) -> list[Candidate]:
        return await self.candidates.list_by_opening(opening_id)

    async def add_candidate(
        self,
        opening_id: uuid.UUID,
        full_name: str,
        email: str,
        phone: str | None,
        resume: UploadFile | None,
        requester: User,
    ) -> Candidate:
        _require_hr(requester)
        opening = await self.openings.get_by_id(opening_id)
        if opening is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job opening not found")

        resume_path = resume_mime = None
        resume_size = None
        resume_name = None
        if resume is not None and resume.filename:
            resume_path, resume_mime, resume_size = await save_upload(resume, uuid.uuid4())
            resume_name = resume.filename

        candidate = Candidate(
            job_opening_id=opening_id,
            full_name=full_name,
            email=email,
            phone=phone,
            resume_file_name=resume_name,
            resume_file_path=resume_path,
            resume_mime_type=resume_mime,
            resume_file_size=resume_size,
            created_by=requester.id,
        )
        await self.candidates.create(candidate)
        await self.audit.log(requester.id, "candidate_add", "candidate", str(candidate.id))
        return candidate

    async def update_stage(
        self, candidate_id: uuid.UUID, new_stage: CandidateStage, notes: str | None, requester: User
    ) -> Candidate:
        _require_hr(requester)
        candidate = await self.candidates.get_by_id(candidate_id)
        if candidate is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
        if candidate.stage == CandidateStage.HIRED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This candidate has already been hired and converted to an employee.",
            )
        candidate.stage = new_stage
        candidate.notes = notes
        await self.candidates.save(candidate)
        await self.audit.log(requester.id, "candidate_stage_update", "candidate", str(candidate_id))
        return candidate

    async def convert_to_employee(self, candidate_id: uuid.UUID, requester: User) -> CandidateConvertResponse:
        _require_hr(requester)
        candidate = await self.candidates.get_by_id(candidate_id)
        if candidate is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
        if candidate.converted_employee_id is not None:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Candidate already converted.")

        opening = await self.openings.get_by_id(candidate.job_opening_id)

        payload = EmployeeCreateRequest(
            full_name=candidate.full_name,
            official_email=candidate.email,
            department=opening.department if opening else None,
            designation=opening.title if opening else None,
            employment_type=EmploymentType.FULL_TIME,
        )
        result = await EmployeeService(self.db).create_employee(payload, requester)

        # New hires start mid-pipeline, not fully onboarded — otherwise
        # they'd never appear on the Onboarding checklist.
        employee_service = EmployeeService(self.db)
        employee_row = await employee_service.repo.get_by_id(result.id)
        if employee_row:
            employee_row.selection_status = SelectionStatus.SELECTED
            await employee_service.repo.save(employee_row)

        candidate.stage = CandidateStage.HIRED
        candidate.converted_employee_id = result.id
        await self.candidates.save(candidate)
        await self.audit.log(
            requester.id, "candidate_convert", "candidate", str(candidate_id), detail=str(result.id)
        )

        return CandidateConvertResponse(
            employee_id=result.id,
            official_email=result.official_email,
            temporary_password=result.temporary_password,
        )

    async def get_resume(self, candidate_id: uuid.UUID, requester: User) -> Candidate:
        _require_hr(requester)
        candidate = await self.candidates.get_by_id(candidate_id)
        if candidate is None or not candidate.resume_file_path:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found")
        return candidate
