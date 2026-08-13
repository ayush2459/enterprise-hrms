from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import EmployeeProject
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.services.employee_service import FULL_ACCESS_ROLES


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _check_access(self, requester: User):
        if requester.role not in FULL_ACCESS_ROLES:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only HR Admin, HR Executive, or System Admin can manage projects.",
            )

    async def list_for_employee(self, employee_id: UUID) -> list[EmployeeProject]:
        result = await self.db.execute(
            select(EmployeeProject)
            .where(EmployeeProject.employee_id == employee_id)
            .order_by(EmployeeProject.start_date.desc().nullslast())
        )
        return list(result.scalars().all())

    async def create(
        self,
        payload: ProjectCreate,
        requester: User,
    ) -> EmployeeProject:
        self._check_access(requester)

        project = EmployeeProject(**payload.model_dump())
        self.db.add(project)

        await self.db.flush()
        await self.db.refresh(project)

        return project

    async def update(
        self,
        project_id: UUID,
        payload: ProjectUpdate,
        requester: User,
    ) -> EmployeeProject | None:
        self._check_access(requester)

        result = await self.db.execute(
            select(EmployeeProject).where(
                EmployeeProject.id == project_id
            )
        )

        project = result.scalar_one_or_none()

        if project is None:
            return None

        for key, value in payload.model_dump().items():
            setattr(project, key, value)

        await self.db.flush()
        await self.db.refresh(project)

        return project

    async def delete(
        self,
        project_id: UUID,
        requester: User,
    ) -> bool:
        self._check_access(requester)

        result = await self.db.execute(
            select(EmployeeProject).where(
                EmployeeProject.id == project_id
            )
        )

        project = result.scalar_one_or_none()

        if project is None:
            return False

        await self.db.delete(project)
        await self.db.flush()

        return True
