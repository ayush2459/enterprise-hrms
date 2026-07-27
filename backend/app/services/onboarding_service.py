"""
Onboarding: employees whose selection_status isn't yet JOINED still
have outstanding document/BGV items. This reuses the Documents and BGV
modules rather than duplicating state — the checklist is computed live
from what's already been submitted/cleared.
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import BGVCheckStatus, DocumentStatus, RoleEnum, SelectionStatus
from app.models.user import User
from app.repositories.bgv_repository import BGVRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.employee_repository import EmployeeRepository
from app.schemas.onboarding import OnboardingChecklistItem, OnboardingStatus

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}

REQUIRED_DOCUMENT_TYPES = ["PAN Card", "Aadhaar Card", "Educational Certificates", "Offer Letter", "Bank Details"]
REQUIRED_BGV_TYPES = ["education", "employment", "address", "criminal", "reference"]


class OnboardingService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.employees = EmployeeRepository(db)
        self.documents = DocumentRepository(db)
        self.bgv = BGVRepository(db)

    async def list_in_progress(self, requester: User) -> list[OnboardingStatus]:
        if requester.role not in HR_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR only.")

        all_employees = await self.employees.list_all(0, 1000)
        onboarding_employees = [e for e in all_employees if e.selection_status != SelectionStatus.JOINED]

        results = []
        for emp in onboarding_employees:
            results.append(await self._build_status(emp))
        return results

    async def _build_status(self, employee) -> OnboardingStatus:
        docs = await self.documents.list_by_employee(employee.id)
        checks = await self.bgv.list_by_employee(employee.id)

        submitted_types = {d.document_type for d in docs if d.status == DocumentStatus.VERIFIED}
        cleared_types = {c.check_type for c in checks if c.status == BGVCheckStatus.CLEARED}

        doc_items = [
            OnboardingChecklistItem(label=t, complete=t in submitted_types) for t in REQUIRED_DOCUMENT_TYPES
        ]
        bgv_items = [
            OnboardingChecklistItem(label=t.capitalize(), complete=t in cleared_types)
            for t in REQUIRED_BGV_TYPES
        ]
        all_complete = all(i.complete for i in doc_items) and all(i.complete for i in bgv_items)

        return OnboardingStatus(
            employee_id=employee.id,
            full_name=employee.full_name,
            date_of_joining=employee.date_of_joining,
            documents=doc_items,
            bgv=bgv_items,
            all_complete=all_complete,
        )

    async def mark_complete(self, employee_id: UUID, requester: User) -> None:
        if requester.role not in HR_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="HR only.")
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        employee.selection_status = SelectionStatus.JOINED
        await self.employees.save(employee)
