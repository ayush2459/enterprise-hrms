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
  total: number;
  active: number;
  on_leave: number;
  offboarded: number;
}

/* =========================================================
   EMPLOYEE / HRMS SUPPORT TYPES
   ========================================================= */

export interface DepartmentBreakdown {
  department: string;
  count: number;
}

export interface HeadcountPoint {
  month: string;
  count: number;
}

export interface RecentJoiner {
  employee_id: string;
  full_name: string;
  department: string | null;
  designation: string | null;
  date_of_joining: string;
}

export interface RecentDeparture {
  employee_id: string;
  full_name: string;
  department: string | null;
  designation: string | null;
  status: string;
  separation_date: string | null;
  separation_reason: string | null;
}

export interface SeparatedEmployeeSummary {
  employee_id: string;
  full_name: string;
  department: string | null;
  designation: string | null;
  status: string;
  separation_date: string | null;
  separation_reason: string | null;
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
  description: string | null;
  effective_date: string | null;
  created_at?: string | null;
}

export interface UpcomingEvent {
  employee_id: string | null;
  full_name: string;
  event_type: "birthday" | "work_anniversary" | "company_event";
  event_date: string;
  category?: string | null;
}

export interface SmartAlert {
  severity: "critical" | "warning" | "info";
  message: string;
  count: number;
  link: string;
}

/* =========================================================
   DASHBOARD
   ========================================================= */

export interface DashboardSummary {
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
  recently_separated: SeparatedEmployeeSummary[];

  pending_approvals: PendingApprovals;

  policy_updates: PolicyUpdate[];
  upcoming_events: UpcomingEvent[];

  /* Smart HR alerts */
  smart_alerts: SmartAlert[];
}

/* =========================================================
   COMPANY EVENTS / HOLIDAYS
   ========================================================= */

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string | null;
}

export interface CompanyEvent {
  id: string;
  title: string;
  event_date: string;
  category: string;
  description?: string | null;
}

/* =========================================================
   ASSETS
   ========================================================= */

export interface Asset {
  id: string;
  employee_id: string;
  asset_type: string;
  asset_name: string;
  serial_number: string | null;
  assigned_date: string | null;
  returned_date: string | null;
  status: string;
  notes: string | null;
}

/* =========================================================
   EMPLOYEE IMPORT
   ========================================================= */

export interface EmployeeImportRowError {
  row: number;
  identifier: string;
  error: string;
}

export interface EmployeeImportResult {
  created: number;
  updated: number;
  skipped: number;
  errors: EmployeeImportRowError[];
}

/* =========================================================
   GENERIC API TYPES
   ========================================================= */

export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

/* =========================================================
   LEAVE
   ========================================================= */

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string | null;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  status: string;
  created_at?: string | null;
}

/* =========================================================
   DOCUMENTS
   ========================================================= */

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_type: string;
  document_name: string;
  file_url?: string | null;
  verification_status?: string | null;
  uploaded_at?: string | null;
}

/* =========================================================
   INSURANCE
   ========================================================= */

export interface InsurancePolicy {
  id: string;
  employee_id: string;
  policy_number?: string | null;
  provider?: string | null;
  policy_type?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
}

/* =========================================================
   BACKGROUND CHECK
   ========================================================= */

export interface BackgroundCheck {
  id: string;
  employee_id: string;
  status: string;
  initiated_at?: string | null;
  completed_at?: string | null;
  remarks?: string | null;
}
