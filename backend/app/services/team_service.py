"""
Team & Org Structure (spec Section 5.6). The org snippet (manager +
direct reports) and roster are non-sensitive org data — any
authenticated user can view them for any employee, same as the
company directory. The status summary is different: it aggregates
document/BGV completion into counts only (never raw sensitive field
values), and is restricted to the team's own manager or HR roles.
"""
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import DocumentStatus, BGVCheckStatus, RoleEnum
from app.models.user import User
from app.repositories.bgv_repository import BGVRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.user_repository import UserRepository
from app.schemas.team import OrgSnippet, TeamMemberRead, TeamStatusRow

HR_ROLES = {RoleEnum.HR_ADMIN, RoleEnum.HR_EXECUTIVE, RoleEnum.SYSTEM_ADMIN}


class TeamService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.employees = EmployeeRepository(db)
        self.users = UserRepository(db)
        self.documents = DocumentRepository(db)
        self.bgv = BGVRepository(db)

    async def _to_team_member(self, employee) -> TeamMemberRead:
        user = await self.users.get_by_id(employee.user_id)
        return TeamMemberRead(
            id=employee.id,
            full_name=employee.full_name,
            designation=employee.designation,
            department=employee.department,
            official_email=user.official_email if user else "",
            status=employee.status,
            employment_type=employee.employment_type,
        )

    async def get_org_snippet(self, employee_id: UUID) -> OrgSnippet:
        employee = await self.employees.get_by_id(employee_id)
        if employee is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

        manager = None
        if employee.reporting_manager_id:
            manager_employee = await self.employees.get_by_id(employee.reporting_manager_id)
            if manager_employee:
                manager = await self._to_team_member(manager_employee)

        reports = await self.employees.list_direct_reports(employee_id)
        direct_reports = [await self._to_team_member(r) for r in reports]

        return OrgSnippet(manager=manager, direct_reports=direct_reports)

    async def get_status_summary(self, employee_id: UUID, requester: User) -> list[TeamStatusRow]:
        is_hr = requester.role in HR_ROLES

        if not is_hr:
            requester_employee = await self.employees.get_by_user_id(requester.id)
            if requester_employee is None or requester_employee.id != employee_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only this team's manager or HR can view its status summary.",
                )

        reports = await self.employees.list_direct_reports(employee_id)
        rows = []
        for report in reports:
            docs = await self.documents.list_by_employee(report.id)
            checks = await self.bgv.list_by_employee(report.id)
            rows.append(
                TeamStatusRow(
                    employee_id=report.id,
                    full_name=report.full_name,
                    documents_verified=sum(1 for d in docs if d.status == DocumentStatus.VERIFIED),
                    documents_total=len(docs),
                    bgv_cleared=sum(1 for c in checks if c.status == BGVCheckStatus.CLEARED),
                    bgv_total=len(checks),
                )
            )
        return rows
