export type Role =
  | "employee"
  | "reporting_manager"
  | "hr_executive"
  | "hr_admin"
  | "system_admin";

export interface User {
  id: string;
  official_email: string;
  employee_id: string | null;
  role: Role;
  is_active: boolean;
  mfa_enabled: boolean;
}

export interface EmployeePublic {
  id: string;
  full_name: string;
  gender: string | null;
  department: string | null;
  designation: string | null;
  employment_type: "full_time" | "intern" | "contract";
  date_of_joining: string | null;
  photo_url: string | null;
  status: "active" | "on_leave" | "offboarded";
  notice_period_days: number | null;
  conversion_status: "not_applicable" | "pending" | "approved" | "rejected";
  offboard_reason:
    | "resignation"
    | "termination"
    | "contract_end"
    | "retirement"
    | "abandonment"
    | "other"
    | null;
  offboarded_at: string | null;
}

export interface EmployeeFull extends EmployeePublic {
  date_of_birth: string | null;
  gender: string | null;
  personal_address: string | null;
  blood_group: string | null;
  emergency_contact: string | null;
  personal_email: string | null;
  mobile_number: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_name: string | null;
  pf_number: string | null;
}

export interface EmployeeCreateInput {
  full_name: string;
  official_email: string;
  employee_id?: string;
  department?: string;
  designation?: string;
  employment_type: "full_time" | "intern" | "contract";
  date_of_joining?: string;
  notice_period_days?: number;
}

export interface EmployeeCreateResult {
  id: string;
  full_name: string;
  official_email: string;
  temporary_password: string;
}

export interface EmployeeStats {
  total_employees: number;
  active_today: number;
  pending_bgv: number | null;
  policy_acknowledgements_due: number | null;
}

export interface LoginResponse {
  status: "success" | "mfa_required" | "captcha_required";
  tokens?: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
}

export type HRDocumentType =
  | "pan_card"
  | "aadhaar_card"
  | "resume"
  | "passport"
  | "photograph"
  | "address_proof"
  | "bank_proof"
  | "educational_certificate"
  | "class_10_certificate"
  | "class_12_certificate"
  | "graduation_certificate"
  | "employment_proof"
  | "joining_letter"
  | "offer_letter"
  | "appraisal_letter"
  | "relieving_letter"
  | "experience_letter"
  | "other"

export type DocumentStatus = "pending_upload" | "submitted" | "verified" | "rejected" | "expired";

export interface DocumentRecord {
  id: string;
  employee_id: string;
  document_type: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  status: DocumentStatus;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
}

export type BGVCheckType = "education" | "employment" | "address" | "criminal" | "reference";
export type BGVCheckStatus = "initiated" | "in_progress" | "cleared" | "flagged";

export interface BGVCheck {
  id: string;
  employee_id: string;
  check_type: BGVCheckType;
  status: BGVCheckStatus;
  notes: string | null;
  cleared_at: string | null;
  updated_at: string;
}

export interface PolicyRecord {
  id: string;
  title: string;
  category: string;
  version: number;
  file_name: string;
  file_size_bytes: number;
  created_at: string;
}

export interface PolicyWithAck extends PolicyRecord {
  acknowledged: boolean;
}

export interface PolicyAcknowledgementStatus {
  user_id: string;
  full_name: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
}

export interface MFASetupResponse {
  secret: string;
  provisioning_uri: string;
}

export interface TeamMember {
  id: string;
  full_name: string;
  designation: string | null;
  department: string | null;
  official_email: string;
  status: "active" | "on_leave" | "offboarded";
  employment_type: "full_time" | "intern" | "contract";
}

export interface OrgSnippet {
  manager: TeamMember | null;
  direct_reports: TeamMember[];
}

export interface TeamStatusRow {
  employee_id: string;
  full_name: string;
  documents_verified: number;
  documents_total: number;
  bgv_cleared: number;
  bgv_total: number;
}

export type JobOpeningStatus = "open" | "on_hold" | "closed";
export type CandidateStage = "applied" | "shortlisted" | "interview" | "offer_extended" | "hired" | "rejected";

export interface JobOpening {
  id: string;
  title: string;
  department: string;
  positions_count: number;
  status: JobOpeningStatus;
  created_at: string;
}

export interface Candidate {
  id: string;
  job_opening_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  notice_period_days: number | null;
  resume_file_name: string | null;
  stage: CandidateStage;
  notes: string | null;
  converted_employee_id: string | null;
  created_at: string;
}

export interface CandidateConvertResult {
  employee_id: string;
  official_email: string;
  temporary_password: string;
}

export interface OnboardingChecklistItem {
  label: string;
  complete: boolean;
}

export interface OnboardingStatus {
  employee_id: string;
  full_name: string;
  date_of_joining: string | null;
  documents: OnboardingChecklistItem[];
  bgv: OnboardingChecklistItem[];
  all_complete: boolean;
}

export interface InsurancePolicy {
  id: string;
  employee_id: string;
  policy_number: string;
  insurer_name: string;
  plan_type: string;
  sum_insured: number;
  premium_employer_paid: number;
  premium_employee_contribution: number;
  valid_from: string;
  valid_to: string;
  benefits: string[];
}

export interface InsurancePolicyInput {
  policy_number: string;
  insurer_name: string;
  plan_type: string;
  sum_insured: number;
  premium_employer_paid: number;
  premium_employee_contribution: number;
  valid_from: string;
  valid_to: string;
  benefits: string[];
}

export interface Dependent {
  id: string;
  full_name: string;
  relationship: string;
  date_of_birth: string;
  card_id: string;
  verified: boolean;
}

export interface InsuranceFull {
  policy: InsurancePolicy | null;
  dependents: Dependent[];
}

export type ReviewCycleStatus = "active" | "closed";
export type ReviewRating = "not_rated" | "below_expectations" | "meets_expectations" | "exceeds_expectations";
export type ReviewStatus = "pending_self_assessment" | "pending_manager_review" | "completed";

export interface ReviewCycle {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: ReviewCycleStatus;
}

export interface PerformanceReview {
  id: string;
  review_cycle_id: string;
  employee_id: string;
  self_assessment: string | null;
  manager_assessment: string | null;
  rating: ReviewRating;
  status: ReviewStatus;
}

export type PayrollStatus = "draft" | "processed" | "paid";

export interface PayrollRecord {
  id: string;
  employee_id: string;
  month: string;
  basic_pay: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  status: PayrollStatus;
}

export type AttendanceStatus = "present" | "absent" | "half_day" | "on_leave" | "holiday";

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  half_day: number;
  on_leave: number;
  holiday: number;
}

export type LeaveRequestStatus = "pending" | "approved" | "rejected";

export interface LeaveType {
  id: string;
  name: string;
  annual_quota_days: number;

  eligibility_gender: "all" | "male" | "female";
  is_paid: boolean;

  carry_forward_allowed: boolean;
  max_carry_forward_days: number;

  encashment_allowed: boolean;

  requires_document: boolean;
  requires_reason: boolean;

  min_days: number;
  max_days: number;
  advance_notice_days: number;

  is_active: boolean;
}


export interface LeaveTypePayload {
  name: string;
  annual_quota_days: number;

  eligibility_gender: "all" | "male" | "female";
  is_paid: boolean;

  carry_forward_allowed: boolean;
  max_carry_forward_days: number;

  encashment_allowed: boolean;

  requires_document: boolean;
  requires_reason: boolean;

  min_days: number;
  max_days: number;
  advance_notice_days: number;

  is_active: boolean;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: LeaveRequestStatus;
}

export interface LeaveBalance {
  leave_type_id: string;
  leave_type_name: string;
  annual_quota_days: number;
  days_used: number;
  days_remaining: number;
}

export interface DepartmentBreakdown {
  department: string;
  count: number;
}

export interface HeadcountPoint {
  month: string;
  count: number;
}

export interface RecentJoiner {
  id: string;
  full_name: string;
  designation: string | null;
  department: string | null;
  date_of_joining: string | null;
}

export interface RecentDeparture {
  id: string;
  full_name: string;
  designation: string | null;
  department: string | null;
  offboard_reason:
    | "resignation"
    | "termination"
    | "contract_end"
    | "retirement"
    | "abandonment"
    | "other"
    | null;
  offboarded_at: string | null;
  status: string;
  separation_date: string;
}

export interface PendingApprovals {
  leave_requests: number;
  document_verifications: number;
  background_checks: number;
  dependent_verifications: number;
}

export interface PolicyUpdate {
  id: string;
  title: string;
  category: string;
  version: number;
}

export interface UpcomingEvent {
  employee_id: string | null;
  full_name: string;
  event_type: "birthday" | "work_anniversary" | "company_event";
  event_date: string;
  category: string | null;
}

export interface CompanyEvent {
  id: string;
  title: string;
  event_date: string;
  category: string;
}

export interface SmartAlert {
  severity: "critical" | "warning" | "info";
  message: string;
  count: number;
  link: string;
}

export interface DashboardSummary {
  smart_alerts: SmartAlert[];
  total_employees: number;
  active_today: number;
  new_joiners_30d: number;
  pending_bgv: number;
  insurance_pending: number;
  pending_document_verifications: number;
  leaves_today: number;
  total_separated: number;

  employees_by_department: DepartmentBreakdown[];
  headcount_trend: HeadcountPoint[];
  recent_joiners: RecentJoiner[];
  recently_separated: RecentDeparture[];

  pending_approvals: PendingApprovals;
  policy_updates: PolicyUpdate[];
  upcoming_events: UpcomingEvent[];
}

export interface FactoryResetResult {
  message: string;
  tables_cleared: number;
  non_admin_users_removed: number;
}

export interface ImportRowError {
  row: number;
  identifier: string;
  error: string;
}

export interface EmployeeImportResult {
  total_rows: number;
  created: number;
  updated: number;
  skipped: number;
  errors: ImportRowError[];
}

export interface Asset {
  id: string;
  employee_id: string;
  asset_type: string;
  asset_name: string;
  serial_number: string | null;
  assigned_date: string | null;
  returned_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  is_optional: boolean;
}


export interface EmployeeProject {
  id: string;
  employee_id: string;
  project_name: string;
  project_code: string | null;
  client_name: string | null;
  role: string | null;
  project_manager: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  allocation_percentage: number;
  technologies: string | null;
  description: string | null;
  responsibilities: string | null;
  achievements: string | null;
  remarks: string | null;
}
