"""
Policy library business logic: uploading a new version supersedes the
old one (archived, not deleted); every employee acknowledgement is
tied to the specific version they acknowledged, so a new version always
starts everyone back at "not acknowledged."
"""
import uuid
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import RoleEnum
from app.models.policy import Policy
from app.models.policy_acknowledgement import PolicyAcknowledgement
from app.models.user import User
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.policy_repository import PolicyAcknowledgementRepository, PolicyRepository
from app.repositories.user_repository import UserRepository
from app.schemas.policy import PolicyAcknowledgementStatus, PolicyReadWithAck
from app.services.audit_service import AuditService
from app.utils.file_storage import save_upload

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class PolicyService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = PolicyRepository(db)
        self.acks = PolicyAcknowledgementRepository(db)
        self.users = UserRepository(db)
        self.employees = EmployeeRepository(db)
        self.audit = AuditService(db)

    async def list_current_for_user(self, requester: User) -> list[PolicyReadWithAck]:
        policies = await self.repo.list_current()
        results = []
        for policy in policies:
            ack = await self.acks.get(policy.id, requester.id)
            results.append(
                PolicyReadWithAck(
                    id=policy.id,
                    title=policy.title,
                    category=policy.category,
                    version=policy.version,
                    file_name=policy.file_name,
                    file_size_bytes=policy.file_size_bytes,
                    created_at=policy.created_at,
                    acknowledged=ack is not None,
                )
            )
        return results

    async def upload(self, title: str, category: str, file: UploadFile, requester: User) -> Policy:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can publish policies.",
            )

        existing = await self.repo.get_current_by_title(title)
        next_version = 1
        if existing:
            existing.is_current = False
            await self.repo.save(existing)
            next_version = existing.version + 1

        # Reuses the Section 7 upload validator (allow-list, MIME check,
        # size cap); folder keyed by a fresh id since policies aren't
        # tied to one employee.
        file_path, mime_type, size_bytes = await save_upload(file, uuid.uuid4())

        policy = Policy(
            title=title,
            category=category,
            version=next_version,
            is_current=True,
            file_name=file.filename or "policy",
            file_path=file_path,
            mime_type=mime_type,
            file_size_bytes=size_bytes,
            uploaded_by=requester.id,
        )
        await self.repo.create(policy)
        await self.audit.log(
            requester.id, "policy_publish", "policy", str(policy.id), detail=f"{title} v{next_version}"
        )
        return policy

    async def acknowledge(self, policy_id: UUID, requester: User) -> None:
        policy = await self.repo.get_by_id(policy_id)
        if policy is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

        existing = await self.acks.get(policy_id, requester.id)
        if existing:
            return  # idempotent - already acknowledged this version

        ack = PolicyAcknowledgement(policy_id=policy_id, user_id=requester.id)
        await self.acks.create(ack)
        await self.audit.log(requester.id, "policy_acknowledge", "policy", str(policy_id))

    async def get_for_download(self, policy_id: UUID, requester: User) -> Policy:
        policy = await self.repo.get_by_id(policy_id)
        if policy is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
        await self.audit.log(requester.id, "policy_download", "policy", str(policy_id))
        return policy

    async def get_compliance(self, policy_id: UUID, requester: User) -> list[PolicyAcknowledgementStatus]:
        if requester.role not in HR_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can view compliance status.",
            )
        policy = await self.repo.get_by_id(policy_id)
        if policy is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

        acks = await self.acks.list_for_policy(policy_id)
        ack_by_user = {a.user_id: a for a in acks}

        employees = await self.employees.list_all(0, 1000)
        results = []
        for emp in employees:
            ack = ack_by_user.get(emp.user_id)
            results.append(
                PolicyAcknowledgementStatus(
                    user_id=emp.user_id,
                    full_name=emp.full_name,
                    acknowledged=ack is not None,
                    acknowledged_at=ack.created_at if ack else None,
                )
            )
        return results
