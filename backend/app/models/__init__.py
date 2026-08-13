"""
Import every model here so `Base.metadata` is fully populated for
Alembic autogenerate (alembic/env.py imports this module).
"""
from app.models.attendance_record import AttendanceRecord  # noqa: F401
from app.models.asset import Asset  # noqa: F401
from app.models.audit_log import AuditLog  # noqa: F401
from app.models.bgv_check import BGVCheck  # noqa: F401
from app.models.candidate import Candidate  # noqa: F401
from app.models.company_event import CompanyEvent  # noqa: F401
from app.models.dependent import Dependent  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.employee import Employee  # noqa: F401
from app.models.holiday import Holiday  # noqa: F401
from app.models.insurance_policy import InsurancePolicy  # noqa: F401
from app.models.job_opening import JobOpening  # noqa: F401
from app.models.leave_request import LeaveRequest  # noqa: F401
from app.models.leave_type import LeaveType  # noqa: F401
from app.models.payroll_record import PayrollRecord  # noqa: F401
from app.models.performance_review import PerformanceReview  # noqa: F401
from app.models.policy import Policy  # noqa: F401
from app.models.policy_acknowledgement import PolicyAcknowledgement  # noqa: F401
from app.models.refresh_token import RefreshToken  # noqa: F401
from app.models.review_cycle import ReviewCycle  # noqa: F401
from app.models.user import User  # noqa: F401

__all__ = [
    "User",
    "Employee",
    "AuditLog",
    "RefreshToken",
    "Document",
    "BGVCheck",
    "Policy",
    "PolicyAcknowledgement",
    "JobOpening",
    "Candidate",
    "InsurancePolicy",
    "Dependent",
    "ReviewCycle",
    "PerformanceReview",
    "PayrollRecord",
    "AttendanceRecord",
    "LeaveType",
    "LeaveRequest",
    "CompanyEvent",
    "Asset",
    "Holiday",
]
