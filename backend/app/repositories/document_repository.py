from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.document import Document
from app.models.enums import DocumentStatus


class DocumentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, document_id: UUID) -> Document | None:
        result = await self.db.execute(select(Document).where(Document.id == document_id))
        return result.scalar_one_or_none()

    async def list_by_employee(self, employee_id: UUID) -> list[Document]:
        result = await self.db.execute(
            select(Document).where(Document.employee_id == employee_id).order_by(Document.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_all(self, skip: int = 0, limit: int = 50) -> list[Document]:
        result = await self.db.execute(
            select(Document).order_by(Document.created_at.desc()).offset(skip).limit(limit)
        )
        return list(result.scalars().all())

    async def count_pending_verification(self) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Document).where(Document.status == DocumentStatus.SUBMITTED)
        )
        return result.scalar_one()

    async def create(self, document: Document) -> Document:
        self.db.add(document)
        await self.db.flush()
        await self.db.refresh(document)
        return document

    async def save(self, document: Document) -> Document:
        await self.db.flush()
        await self.db.refresh(document)
        return document
