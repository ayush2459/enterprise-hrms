"""
Document upload/verification business logic. Employees can upload and
view their own documents; only HR Admin/Executive/System Admin can
verify or reject, matching the access matrix in Section 3.
"""
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.models.employee import Employee
from app.models.enums import DocumentStatus, RoleEnum
from app.models.user import User
from app.repositories.document_repository import DocumentRepository
from app.repositories.employee_repository import EmployeeRepository
from app.services.audit_service import AuditService
from app.utils.file_storage import save_upload

FULL_ACCESS_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class DocumentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = DocumentRepository(db)
        self.employees = EmployeeRepository(db)
        self.audit = AuditService(db)

    async def _assert_can_view(self, employee: Employee, requester: User) -> None:
        is_self = employee.user_id == requester.id
        if not is_self and requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized.")

    async def list_for_employee(self, employee_id: UUID, requester: User) -> list[Document]:
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
        await self._assert_can_view(employee, requester)
        await self.audit.log(requester.id, "documents_list", "employee", str(employee_id))
        return await self.repo.list_by_employee(employee_id)

    async def upload(
        self, employee_id: UUID, document_type: str, file: UploadFile, requester: User
    ) -> Document:
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        is_self = employee.user_id == requester.id
        if not is_self and requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only upload documents for yourself.",
            )

        file_path, mime_type, size_bytes = await save_upload(file, employee_id)

        document = Document(
            employee_id=employee_id,
            document_type=document_type,
            file_name=file.filename or "unnamed",
            file_path=file_path,
            mime_type=mime_type,
            file_size_bytes=size_bytes,
            status=DocumentStatus.SUBMITTED,
            uploaded_by=requester.id,
        )
        await self.repo.create(document)
        await self.audit.log(
            requester.id, "document_upload", "document", str(document.id), detail=document_type
        )
        return document

    async def verify(
        self, document_id: UUID, new_status: DocumentStatus, notes: str | None, requester: User
    ) -> Document:
        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can verify documents.",
            )
        document = await self.repo.get_by_id(document_id)
        if document is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

        from datetime import datetime, timezone

        document.status = new_status
        document.notes = notes
        document.verified_by = requester.id
        document.verified_at = datetime.now(timezone.utc)
        await self.repo.save(document)

        await self.audit.log(
            requester.id, f"document_{new_status.value}", "document", str(document.id)
        )
        return document

    async def get_for_download(self, document_id: UUID, requester: User) -> Document:
        document = await self.repo.get_by_id(document_id)
        if document is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        employee = await self.employees.get_by_id(document.employee_id)
        await self._assert_can_view(employee, requester)
        await self.audit.log(requester.id, "document_download", "document", str(document.id))
        return document
