"""
Company-wide dashboard aggregation. Every number here is computed live
from the actual tables each module already owns — nothing cached or
fabricated. Open to any authenticated user since it's all aggregate
counts (no individual sensitive field values), same visibility tier as
the employee directory and org chart.
"""
from datetime import date, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.bgv_repository import BGVRepository
from app.repositories.company_event_repository import CompanyEventRepository
from app.repositories.document_repository import DocumentRepository
from app.repositories.employee_repository import EmployeeRepository
from app.repositories.insurance_repository import DependentRepository, InsurancePolicyRepository
from app.repositories.leave_repository import LeaveRequestRepository
from app.repositories.policy_repository import PolicyRepository
from app.schemas.dashboard import (
    DashboardSummary,
    DepartmentBreakdown,
    HeadcountPoint,
    PendingApprovals,
    PolicyUpdate,
    RecentJoiner,
    UpcomingEvent,
)

EVENT_WINDOW_DAYS = 30


def _next_occurrence(month: int, day: int, today: date) -> date:
    """Given a recurring month/day (birthday, anniversary), find the next
    occurrence on or after today, handling year rollover and Feb 29."""
    try:
        candidate = date(today.year, month, day)
    except ValueError:
        candidate = date(today.year, month, 28)  # Feb 29 in a non-leap year
    if candidate < today:
        try:
            candidate = date(today.year + 1, month, day)
        except ValueError:
            candidate = date(today.year + 1, month, 28)
    return candidate


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.employees = EmployeeRepository(db)
        self.bgv = BGVRepository(db)
        self.documents = DocumentRepository(db)
        self.insurance = InsurancePolicyRepository(db)
        self.dependents = DependentRepository(db)
        self.leaves = LeaveRequestRepository(db)
        self.policies = PolicyRepository(db)
        self.company_events = CompanyEventRepository(db)

    async def get_summary(self) -> DashboardSummary:
        today = date.today()
        thirty_days_ago = today - timedelta(days=30)

        total_employees = await self.employees.count_total()
        active_today = await self.employees.count_active_today()
        new_joiners_30d = await self.employees.count_new_joiners_since(thirty_days_ago)
        pending_bgv = await self.bgv.count_pending()
        insurance_pending = max(total_employees - await self.insurance.count_all(), 0)
        pending_doc_verifications = await self.documents.count_pending_verification()
        leaves_today = await self.leaves.count_active_today()
        pending_leave_requests = await self.leaves.count_pending()
        pending_dependent_verifications = await self.dependents.count_unverified()

        dept_rows = await self.employees.count_by_department()
        employees_by_department = [DepartmentBreakdown(department=d, count=c) for d, c in dept_rows]

        recent_joiner_rows = await self.employees.list_recent_joiners(5)
        recent_joiners = [
            RecentJoiner(
                id=e.id,
                full_name=e.full_name,
                designation=e.designation,
                department=e.department,
                date_of_joining=e.date_of_joining,
            )
            for e in recent_joiner_rows
        ]

        policy_rows = await self.policies.list_recent(5)
        policy_updates = [
            PolicyUpdate(id=p.id, title=p.title, category=p.category, version=p.version) for p in policy_rows
        ]

        # ---- Headcount trend: cumulative headcount at the end of each
        # month this year, computed from real date_of_joining values ----
        all_employees = await self.employees.list_all_for_aggregation()
        joined_this_year = sorted(
            (e.date_of_joining for e in all_employees if e.date_of_joining and e.date_of_joining.year == today.year)
        )
        baseline = sum(1 for e in all_employees if e.date_of_joining and e.date_of_joining.year < today.year)
        headcount_trend: list[HeadcountPoint] = []
        running = baseline
        for month_num in range(1, today.month + 1):
            month_end = date(today.year, month_num, 28) + timedelta(days=4)
            month_end = month_end.replace(day=1) - timedelta(days=1)
            running = baseline + sum(1 for d in joined_this_year if d <= month_end)
            headcount_trend.append(HeadcountPoint(month=f"{today.year}-{month_num:02d}", count=running))

        # ---- Upcoming events: real birthdays/anniversaries within 30 days ----
        upcoming_events: list[UpcomingEvent] = []
        window_end = today + timedelta(days=EVENT_WINDOW_DAYS)
        for e in all_employees:
            if e.date_of_birth:
                occurrence = _next_occurrence(e.date_of_birth.month, e.date_of_birth.day, today)
                if today <= occurrence <= window_end:
                    upcoming_events.append(
                        UpcomingEvent(
                            employee_id=e.id, full_name=e.full_name, event_type="birthday", event_date=occurrence
                        )
                    )
            if e.date_of_joining:
                occurrence = _next_occurrence(e.date_of_joining.month, e.date_of_joining.day, today)
                if today <= occurrence <= window_end and occurrence.year > e.date_of_joining.year:
                    upcoming_events.append(
                        UpcomingEvent(
                            employee_id=e.id,
                            full_name=e.full_name,
                            event_type="work_anniversary",
                            event_date=occurrence,
                        )
                    )
        company_events = await self.company_events.list_upcoming(EVENT_WINDOW_DAYS)
        for ce in company_events:
            upcoming_events.append(
                UpcomingEvent(
                    employee_id=None,
                    full_name=ce.title,
                    event_type="company_event",
                    event_date=ce.event_date,
                    category=ce.category,
                )
            )
        upcoming_events.sort(key=lambda ev: ev.event_date)

        return DashboardSummary(
            total_employees=total_employees,
            active_today=active_today,
            new_joiners_30d=new_joiners_30d,
            pending_bgv=pending_bgv,
            insurance_pending=insurance_pending,
            pending_document_verifications=pending_doc_verifications,
            leaves_today=leaves_today,
            employees_by_department=employees_by_department,
            headcount_trend=headcount_trend,
            recent_joiners=recent_joiners,
            pending_approvals=PendingApprovals(
                leave_requests=pending_leave_requests,
                document_verifications=pending_doc_verifications,
                background_checks=pending_bgv,
                dependent_verifications=pending_dependent_verifications,
            ),
            policy_updates=policy_updates,
            upcoming_events=upcoming_events[:10],
        )
