import enum


class RoleEnum(str, enum.Enum):
    """Matches Section 3 (User Roles & Access Control) of the spec."""

    EMPLOYEE = "employee"
    REPORTING_MANAGER = "reporting_manager"
    HR_EXECUTIVE = "hr_executive"
    HR_ADMIN = "hr_admin"
    SYSTEM_ADMIN = "system_admin"


class EmploymentType(str, enum.Enum):
    FULL_TIME = "full_time"
    INTERN = "intern"
    CONTRACT = "contract"


class SelectionStatus(str, enum.Enum):
    SHORTLISTED = "shortlisted"
    SELECTED = "selected"
    OFFER_EXTENDED = "offer_extended"
    JOINED = "joined"


class DocumentStatus(str, enum.Enum):
    PENDING_UPLOAD = "pending_upload"
    SUBMITTED = "submitted"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


class BGVCheckStatus(str, enum.Enum):
    INITIATED = "initiated"
    IN_PROGRESS = "in_progress"
    CLEARED = "cleared"
    FLAGGED = "flagged"


class EmployeeStatus(str, enum.Enum):
    ACTIVE = "active"
    ON_LEAVE = "on_leave"
    OFFBOARDED = "offboarded"


class JobOpeningStatus(str, enum.Enum):
    OPEN = "open"
    ON_HOLD = "on_hold"
    CLOSED = "closed"


class CandidateStage(str, enum.Enum):
    APPLIED = "applied"
    SHORTLISTED = "shortlisted"
    INTERVIEW = "interview"
    OFFER_EXTENDED = "offer_extended"
    HIRED = "hired"
    REJECTED = "rejected"


class ReviewCycleStatus(str, enum.Enum):
    ACTIVE = "active"
    CLOSED = "closed"


class ReviewRating(str, enum.Enum):
    NOT_RATED = "not_rated"
    BELOW_EXPECTATIONS = "below_expectations"
    MEETS_EXPECTATIONS = "meets_expectations"
    EXCEEDS_EXPECTATIONS = "exceeds_expectations"


class ReviewStatus(str, enum.Enum):
    PENDING_SELF_ASSESSMENT = "pending_self_assessment"
    PENDING_MANAGER_REVIEW = "pending_manager_review"
    COMPLETED = "completed"


class PayrollStatus(str, enum.Enum):
    DRAFT = "draft"
    PROCESSED = "processed"
    PAID = "paid"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    HALF_DAY = "half_day"
    ON_LEAVE = "on_leave"
    HOLIDAY = "holiday"


class LeaveRequestStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
