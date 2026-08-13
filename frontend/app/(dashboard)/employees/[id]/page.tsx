"use client";

import { holidayService } from "@/services/holiday.service";
import { projectService } from "@/services/project.service";
import { teamService } from "@/services/team.service";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Plus, User as UserIcon, UserX, UserCheck, Save, X , CalendarDays, Pencil, Trash2, ChevronDown, ChevronUp, GitBranch} from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { EditPersonalDetailsModal } from "@/components/employees/EditPersonalDetailsModal";
import { OffboardEmployeeModal } from "@/components/employees/OffboardEmployeeModal";
import { AddDependentModal } from "@/components/insurance/AddDependentModal";
import { employeeService } from "@/services/employee.service";

import { insuranceService } from "@/services/insurance.service";
import { assetService } from "@/services/asset.service";
import { AssetManagement } from "@/components/employees/AssetManagement";
import { payrollService } from "@/services/payroll.service";
import { performanceService } from "@/services/performance.service";
import { attendanceService } from "@/services/attendance.service";
import { leaveService } from "@/services/leave.service";
import { documentService } from "@/services/document.service";
import { bgvService } from "@/services/bgv.service";
import { useAuthStore } from "@/store/auth.store";


import type {

Asset,
  AttendanceSummary,
  BGVCheck,
  DocumentRecord,
  EmployeeFull,
  EmployeePublic,
  Holiday,
  OrgSnippet,
  InsuranceFull,
  LeaveBalance,
  PayrollRecord,
  PerformanceReview,
  EmployeeProject,
} from "@/types";

const HR_DOCUMENT_LABELS: Record<string, string> = {
  pan_card: "PAN Card",
  aadhaar_card: "Aadhaar Card",
  resume: "Resume / CV",
  passport: "Passport",
  photograph: "Photograph",
  address_proof: "Address Proof",
  bank_proof: "Bank Proof / Cancelled Cheque",
  educational_certificate: "Educational Certificate",
  class_10_certificate: "10th Certificate",
  class_12_certificate: "12th Certificate",
  graduation_certificate: "Graduation Certificate",
  employment_proof: "Employment Proof",
  joining_letter: "Joining Letter",
  offer_letter: "Offer Letter",
  appraisal_letter: "Appraisal Letter",
  relieving_letter: "Relieving Letter",
  experience_letter: "Experience Letter",
  other: "Other Document",
};



function isFull(e: EmployeeFull | EmployeePublic): e is EmployeeFull {
  return "personal_address" in e;
}

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-brand-dark">{value ?? "—"}</p>
    </div>
  );
}

function SectionCard({
  title,
  children,
  unavailable,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  unavailable?: boolean;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-brand-dark">{title}</h2>
        {action}
      </div>
      {unavailable ? (
        <p className="text-xs text-gray-400">Not accessible with your current role.</p>
      ) : (
        children
      )}
    </Card>
  );
}

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [employee, setEmployee] = useState<EmployeeFull | EmployeePublic | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOffboardModal, setShowOffboardModal] = useState(false);
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [reactivateError, setReactivateError] = useState<string | null>(null);
  const [showAddDependentModal, setShowAddDependentModal] = useState(false);
  const [org, setOrg] = useState<OrgSnippet | null>(null);
  const [insurance, setInsurance] = useState<InsuranceFull | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [insuranceAccess, setInsuranceAccess] = useState(true);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);

  const [showPayrollEditor, setShowPayrollEditor] = useState(false);
  const [payrollSaving, setPayrollSaving] = useState(false);
  const [payrollError, setPayrollError] = useState<string | null>(null);
  const [editPayroll, setEditPayroll] = useState({
    month: "",
    basicPay: "",
    allowances: "",
    deductions: "",
  });

  const [payrollAccess, setPayrollAccess] = useState(true);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [bgvChecks, setBgvChecks] = useState<BGVCheck[]>([]);
  const [loading, setLoading] = useState(true);

  // Annual holidays
  const [holidayYear, setHolidayYear] = useState(new Date().getFullYear());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [projects, setProjects] = useState<EmployeeProject[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<EmployeeProject | null>(null);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [holidayLoading, setHolidayLoading] = useState(false);
  const [holidaySaving, setHolidaySaving] = useState(false);
  const [holidayFormOpen, setHolidayFormOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayOptional, setHolidayOptional] = useState(false);

  // Team tree
  const [teamTree, setTeamTree] = useState<OrgSnippet | null>(null);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamOpen, setTeamOpen] = useState(true);

  const [conversionActionLoading, setConversionActionLoading] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const openPayrollEditor = (record: PayrollRecord) => {
    setPayrollError(null);
    setEditPayroll({
      month: record.month,
      basicPay: String(record.basic_pay),
      allowances: String(record.allowances),
      deductions: String(record.deductions),
    });
    setShowPayrollEditor(true);
  };

  const handlePayrollEdit = async () => {
    const record = payroll[0];

    if (!record) return;

    const basicPay = Number(editPayroll.basicPay);
    const allowances = Number(editPayroll.allowances);
    const deductions = Number(editPayroll.deductions);

    if (
      !editPayroll.month ||
      !Number.isFinite(basicPay) ||
      !Number.isFinite(allowances) ||
      !Number.isFinite(deductions) ||
      basicPay < 0 ||
      allowances < 0 ||
      deductions < 0
    ) {
      setPayrollError("Please enter valid salary values.");
      return;
    }

    setPayrollSaving(true);
    setPayrollError(null);

    try {
      const updated = await payrollService.updateRecord(
        record.id,
        editPayroll.month,
        basicPay,
        allowances,
        deductions
      );

      setPayroll((current) =>
        current.map((item) => item.id === updated.id ? updated : item)
      );

      setShowPayrollEditor(false);
    } catch (error) {
      console.error("Failed to update payroll:", error);
      setPayrollError("Unable to update salary details. Please try again.");
    } finally {
      setPayrollSaving(false);
    }
  };

  const reloadEmployee = async () => {
    try {
      const updated = await employeeService.getById(employeeId);
      setEmployee(updated);
    } catch (error) {
      console.error("Failed to reload employee:", error);
    }
  };

  const handleReactivate = async () => {
    setReactivateError(null);
    setReactivateLoading(true);
    try {
      const updated = await employeeService.reactivate(employeeId);
      setEmployee(updated);
    } catch (err: any) {
      setReactivateError(err?.response?.data?.detail ?? "Could not reactivate this employee.");
    } finally {
      setReactivateLoading(false);
    }
  };

  const handleRequestConversion = async () => {
    setConversionError(null);
    setConversionActionLoading(true);
    try {
      const updated = await employeeService.requestConversion(employeeId);
      setEmployee(updated);
    } catch (err: any) {
      setConversionError(err?.response?.data?.detail ?? "Could not submit conversion request.");
    } finally {
      setConversionActionLoading(false);
    }
  };

  const handleDecideConversion = async (approve: boolean) => {
    setConversionError(null);
    setConversionActionLoading(true);
    try {
      const updated = await employeeService.decideConversion(employeeId, approve);
      setEmployee(updated);
    } catch (err: any) {
      setConversionError(err?.response?.data?.detail ?? "Could not record this decision.");
    } finally {
      setConversionActionLoading(false);
    }
  };

  const reloadAssets = () => {
    assetService
      .listForEmployee(employeeId)
      .then(setAssets)
      .catch(() => setAssets([]));
  };

  const reloadInsurance = () => {
    insuranceService
      .getForEmployee(employeeId)
      .then(setInsurance)
      .catch((err) => {
        if (err?.response?.status === 403) setInsuranceAccess(false);
      });
  };

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);

    employeeService.getById(employeeId).then(setEmployee);
    assetService
      .listForEmployee(employeeId)
      .then(setAssets)
      .catch((err) => {
        console.error("Failed to load employee assets:", err);
        setAssets([]);
      });

    // Load employee projects.
    setProjectLoading(true);
    projectService
      .listForEmployee(employeeId)
      .then(setProjects)
      .catch(() => setProjects([]))
      .finally(() => setProjectLoading(false));

    // Load reporting structure for Employee 360.
    setTeamLoading(true);
    teamService
      .getOrgSnippet(employeeId)
      .then((data) => {
        setOrg(data);
        setTeamTree(data);
      })
      .catch(() => {
        setOrg(null);
        setTeamTree(null);
      })
      .finally(() => setTeamLoading(false));

    // Load annual holiday calendar.
    setHolidayLoading(true);
    holidayService
      .listForYear(holidayYear)
      .then(setHolidays)
      .catch(() => setHolidays([]))
      .finally(() => setHolidayLoading(false));

    // Load all assets assigned to this employee.
    reloadAssets();

    insuranceService
      .getForEmployee(employeeId)
      .then(setInsurance)
      .catch((err) => {
        if (err?.response?.status === 403) setInsuranceAccess(false);
      });

    payrollService
      .listForEmployee(employeeId)
      .then(setPayroll)
      .catch((err) => {
        if (err?.response?.status === 403) setPayrollAccess(false);
      });

    performanceService.listForEmployee(employeeId).then(setReviews).catch(() => setReviews([]));
    attendanceService.getSummary(employeeId).then(setAttendance).catch(() => setAttendance(null));
    leaveService.getBalance(employeeId).then(setLeaveBalances).catch(() => setLeaveBalances([]));
    documentService.listForEmployee(employeeId).then(setDocuments).catch(() => setDocuments([]));
    bgvService
      .listForEmployee(employeeId)
      .then(setBgvChecks)
      .catch(() => setBgvChecks([]))
      .finally(() => setLoading(false));
  }, [employeeId]);

  if (loading || !employee) {
    return (
      <>
        <Topbar title="Employee Profile" />
        <div className="p-8">
          <Loader label="Loading profile..." />
        </div>
      </>
    );
  }

  const full = isFull(employee) ? employee : null;
  const age = full ? calculateAge(full.date_of_birth) : null;
  const latestPayslip = payroll[0];
  const latestReview = reviews[reviews.length - 1];
  const documentsVerified = documents.filter((d) => d.status === "verified").length;
  const bgvCleared = bgvChecks.filter((c) => c.status === "cleared").length;
  const isSeparated = employee.status === "offboarded";

  return (
    <>
      <Topbar title="Employee Profile" subtitle={employee.full_name} />
      <div className="p-8 space-y-6">
        <button
          onClick={() => router.push("/employees")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </button>

        {isSeparated && (
          <Card className="border-red-100 bg-red-50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-red-700 capitalize">
                  {employee.status} {employee.offboarded_at && `on ${new Date(employee.offboarded_at).toLocaleDateString()}`}
                </p>
                {employee.offboard_reason && (
                  <p className="mt-1 text-xs text-red-600">{employee.offboard_reason}</p>
                )}
                <p className="mt-1 text-xs text-red-500">
                  This person no longer appears in the active directory or dashboard, and their
                  login has been revoked.
                </p>
              </div>
              {isHR && (
                <Button
                  variant="secondary"
                  onClick={handleReactivate}
                  disabled={reactivateLoading}
                  className="flex shrink-0 items-center gap-2 text-xs"
                >
                  <UserCheck size={14} />
                  {reactivateLoading ? "Restoring..." : "Reactivate"}
                </Button>
              )}
            </div>
            {reactivateError && <p className="mt-2 text-xs text-red-600">{reactivateError}</p>}
          </Card>
        )}

        {/* Header */}
        <Card className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-brand">
            <UserIcon size={28} />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-brand-dark">{employee.full_name}</h1>
            <p className="text-sm text-gray-500">
              {employee.designation ?? "—"} · {employee.department ?? "—"}
            </p>
          </div>
          <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium capitalize text-brand-dark">
            {employee.status.replace("_", " ")}
          </span>
          {isHR && !isSeparated && (
            <Button
              variant="danger"
              onClick={() => setShowOffboardModal(true)}
              className="flex items-center gap-2 text-xs px-3 py-1.5"
            >
              <UserX size={14} />
              Mark as Left
            </Button>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Employment Details */}
          <SectionCard title="Employment Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Employee ID" value={employee.id.slice(0, 8)} />
              <Field label="Department" value={employee.department} />
              <Field label="Position" value={employee.designation} />
              <Field label="Employment Type" value={employee.employment_type.replace("_", " ")} />
              <Field
                label="Date of Joining"
                value={employee.date_of_joining ? new Date(employee.date_of_joining).toLocaleDateString() : null}
              />
              <Field label="Reporting Manager" value={org?.manager?.full_name ?? "—"} />
              <Field
                label="Notice Period"
                value={employee.notice_period_days != null ? `${employee.notice_period_days} days` : null}
              />
            </div>

            {employee.employment_type === "intern" && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                {employee.conversion_status === "pending" ? (
                  <div className="space-y-2">
                    <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                      Conversion to Full-Time — Pending Approval
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDecideConversion(true)}
                        disabled={conversionActionLoading}
                        className="text-xs px-3 py-1.5"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDecideConversion(false)}
                        disabled={conversionActionLoading}
                        className="text-xs px-3 py-1.5"
                      >
                        Reject
                      </Button>
                    </div>
                    <p className="text-xs text-gray-400">
                      Approval by the reporting manager, HR Admin, HR Executive, or System Admin
                      converts this intern to a full-time employee immediately.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {employee.conversion_status === "rejected" && (
                      <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600">
                        Previous Conversion Request Rejected
                      </span>
                    )}
                    <div>
                      <Button
                        onClick={handleRequestConversion}
                        disabled={conversionActionLoading}
                        className="text-xs px-3 py-1.5"
                      >
                        {conversionActionLoading ? "Submitting..." : "Request Conversion to Full-Time"}
                      </Button>
                    </div>
                  </div>
                )}
                {conversionError && <p className="mt-2 text-xs text-red-500">{conversionError}</p>}
              </div>
            )}
          </SectionCard>

          {/* Personal Details */}
          <SectionCard
            title="Personal Details"
            unavailable={!full}
            action={
              full && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
              )
            }
          >
            {full && (
              <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" value={full.full_name} />
                <Field label="Age" value={age !== null ? `${age} years` : null} />
                <Field label="Gender" value={full.gender} />
                <Field label="Blood Group" value={full.blood_group} />
                <Field label="Personal Email" value={full.personal_email} />
                <Field label="Mobile Number" value={full.mobile_number} />
                <Field label="Emergency Contact" value={full.emergency_contact} />
                <Field label="Address" value={full.personal_address} />

                <div className="col-span-2 border-t border-gray-100 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Banking &amp; PF Details
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Field
                      label="Bank Account Number"
                      value={full.bank_account_number}
                    />
                    <Field
                      label="Bank Name"
                      value={full.bank_name}
                    />
                    <Field
                      label="IFSC Code"
                      value={full.bank_ifsc}
                    />
                    <Field
                      label="PF Number"
                      value={full.pf_number}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Banking & Statutory Details
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Bank Account Number"
                    value={full.bank_account_number}
                  />
                  <Field
                    label="Bank Name"
                    value={full.bank_name}
                  />
                  <Field
                    label="IFSC Code"
                    value={full.bank_ifsc}
                  />
                  <Field
                    label="PF Number"
                    value={full.pf_number}
                  />
                </div>
              </div>
              </>
            )}
          </SectionCard>



          {/* ==================================================
              HRHUB_ANNUAL_HOLIDAYS
              ================================================== */}

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">

            <div className="hr-premium-card p-5">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    Annual Holidays
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Company holiday calendar
                  </p>
                </div>

                <div className="flex items-center gap-2">

                  <select
                    value={holidayYear}
                    onChange={(e) => setHolidayYear(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-400"
                  >
                    {[2025, 2026, 2027, 2028].map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const name = window.prompt("Holiday name");
                      if (!name) return;

                      const date = window.prompt(
                        "Date (YYYY-MM-DD)"
                      );

                      if (!date) return;

                      holidayService
                        .create({
                          name,
                          date,
                          is_optional: false,
                        })
                        .then(() =>
                          holidayService.listForYear(holidayYear)
                        )
                        .then(setHolidays);
                    }}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    + Add
                  </button>

                </div>

              </div>

              {holidayLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading holidays...
                </div>
              ) : holidays.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                  No holidays configured for {holidayYear}
                </div>
              ) : (
                <div>
                  {holidays.map((holiday) => {

                    const d = new Date(
                      holiday.date + "T00:00:00"
                    );

                    return (
                      <div
                        key={holiday.id}
                        className="hr-holiday"
                      >

                        <div className="hr-holiday-date">

                          <span className="hr-holiday-day">
                            {d.getDate()}
                          </span>

                          <span className="hr-holiday-month">
                            {d.toLocaleString("en-IN", {
                              month: "short",
                            })}
                          </span>

                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center gap-2">

                            <p className="text-sm font-medium text-slate-900">
                              {holiday.name}
                            </p>

                            {holiday.is_optional && (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                Optional
                              </span>
                            )}

                          </div>

                          <p className="mt-1 text-xs text-slate-400">
                            {d.toLocaleDateString("en-IN", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>

                        </div>

                        <button
                          type="button"
                          className="text-xs font-semibold text-blue-600 hover:underline"
                          onClick={async () => {

                            const name = window.prompt(
                              "Holiday name",
                              holiday.name
                            );

                            if (!name) return;

                            await holidayService.update(
                              holiday.id,
                              {
                                name,
                                date: holiday.date,
                                is_optional: holiday.is_optional,
                              }
                            );

                            setHolidays(
                              await holidayService.listForYear(
                                holidayYear
                              )
                            );
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="text-xs font-semibold text-red-500 hover:underline"
                          onClick={async () => {

                            if (
                              !window.confirm(
                                `Delete ${holiday.name}?`
                              )
                            ) {
                              return;
                            }

                            await holidayService.delete(
                              holiday.id
                            );

                            setHolidays(
                              await holidayService.listForYear(
                                holidayYear
                              )
                            );
                          }}
                        >
                          Delete
                        </button>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* ==================================================
                TEAM TREE
                ================================================== */}

            <div className="hr-premium-card p-5">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    My Team
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Reporting structure
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  {org?.direct_reports?.length ?? 0} Direct Reports
                </span>

              </div>

              {teamLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  Loading team...
                </div>
              ) : (
                <div className="space-y-4">

                  {org?.manager && (
                    <div>

                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Reporting Manager
                      </p>

                      <div className="hr-team-node">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                          {org.manager.full_name
                            .split(" ")
                            .map((x) => x[0])
                            .slice(0, 2)
                            .join("")}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {org.manager.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {org.manager.designation}
                          </p>
                        </div>

                      </div>

                    </div>
                  )}

                  <div>

                    <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Direct Reports
                    </p>

                    {org?.direct_reports?.length ? (
                      <div className="space-y-2">

                        {org.direct_reports.map((member) => (

                          <button
                            key={member.id}
                            type="button"
                            onClick={() =>
                              router.push(
                                `/employees/${member.id}`
                              )
                            }
                            className="hr-team-node w-full text-left"
                          >

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                              {member.full_name
                                .split(" ")
                                .map((x) => x[0])
                                .slice(0, 2)
                                .join("")}
                            </div>

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-sm font-semibold text-slate-900">
                                {member.full_name}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {member.designation}
                              </p>

                            </div>

                            <span className="text-xs text-slate-300">
                              →
                            </span>

                          </button>

                        ))}

                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-xs text-slate-400">
                        No direct reports
                      </div>
                    )}

                  </div>

                </div>
              )}

            </div>

          </div>



          {/* Projects */}
          <SectionCard
            title="Projects"
            action={
              <button
                onClick={() => {
                  setEditingProject(null);
                  setProjectError(null);
                  setShowProjectModal(true);
                }}
                className="flex items-center gap-1 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
              >
                <Plus size={14} />
                Add Project
              </button>
            }
          >
            {projectLoading ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center">
                <p className="text-sm font-medium text-gray-600">
                  No projects assigned
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Add the employee's project assignments, responsibilities and achievements.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {project.project_name}
                          </h3>

                          {project.project_code && (
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-medium text-gray-500">
                              {project.project_code}
                            </span>
                          )}

                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            project.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : project.status === "completed"
                              ? "bg-blue-50 text-blue-700"
                              : project.status === "on_hold"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                          }`}>
                            {project.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                          {project.client_name && (
                            <span>Client: {project.client_name}</span>
                          )}
                          {project.role && (
                            <span>Role: {project.role}</span>
                          )}
                          {project.project_manager && (
                            <span>Manager: {project.project_manager}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingProject(project);
                            setProjectError(null);
                            setShowProjectModal(true);
                          }}
                          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-brand"
                          title="Edit project"
                        >
                          <Pencil size={14} />
                        </button>

                        <button
                          onClick={async () => {
                            if (!confirm(`Delete "${project.project_name}"?`)) return;

                            try {
                              await projectService.delete(project.id);
                              setProjects((current) =>
                                current.filter((item) => item.id !== project.id)
                              );
                            } catch {
                              alert("Unable to delete project.");
                            }
                          }}
                          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 md:grid-cols-4">
                      <Field
                        label="Start Date"
                        value={project.start_date}
                      />
                      <Field
                        label="End Date"
                        value={project.end_date}
                      />
                      <Field
                        label="Allocation"
                        value={`${project.allocation_percentage}%`}
                      />
                      <Field
                        label="Role"
                        value={project.role}
                      />
                    </div>

                    {project.technologies && (
                      <div className="mt-4">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          Technologies
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {project.technologies
                            .split(",")
                            .map((technology: string) => technology.trim())
                            .filter(Boolean)
                            .map((technology: string) => (
                              <span
                                key={technology}
                                className="rounded-full bg-brand/5 px-2.5 py-1 text-[10px] font-medium text-brand"
                              >
                                {technology}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}

                    {project.description && (
                      <div className="mt-4">
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          Description
                        </p>
                        <p className="text-xs leading-5 text-gray-600">
                          {project.description}
                        </p>
                      </div>
                    )}

                    {(project.responsibilities || project.achievements || project.remarks) && (
                      <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-3">
                        {project.responsibilities && (
                          <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                              Responsibilities
                            </p>
                            <p className="text-xs leading-5 text-gray-600">
                              {project.responsibilities}
                            </p>
                          </div>
                        )}

                        {project.achievements && (
                          <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                              Achievements
                            </p>
                            <p className="text-xs leading-5 text-gray-600">
                              {project.achievements}
                            </p>
                          </div>
                        )}

                        {project.remarks && (
                          <div>
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                              Remarks
                            </p>
                            <p className="text-xs leading-5 text-gray-600">
                              {project.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Assets */}
          <SectionCard title="Assets">
            <AssetManagement
              employeeId={employeeId}
              assets={assets}
              onChanged={reloadAssets}
            />
          </SectionCard>

          {/* Insurance */}
          <SectionCard title="Insurance" unavailable={!insuranceAccess}>
            {insurance?.policy ? (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Policy Number" value={insurance.policy.policy_number} />
                <Field label="Insurer" value={insurance.policy.insurer_name} />
                <Field label="Sum Insured" value={`₹${insurance.policy.sum_insured.toLocaleString()}`} />
                <Field
                  label="Valid Through"
                  value={new Date(insurance.policy.valid_to).toLocaleDateString()}
                />
              </div>
            ) : (
              <p className="text-xs text-gray-400">No insurance policy on file.</p>
            )}
          </SectionCard>

          {/* Family / Covered Dependents */}
          <SectionCard
            title="Family (Covered Dependents)"
            unavailable={!insuranceAccess}
            action={
              insurance?.policy && (
                <button
                  onClick={() => setShowAddDependentModal(true)}
                  className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                >
                  <Plus size={12} />
                  Add Family Member
                </button>
              )
            }
          >
            {!insurance?.policy ? (
              <p className="text-xs text-gray-400">
                Add an insurance policy on the{" "}
                <a href="/insurance" className="text-brand hover:underline">
                  Insurance page
                </a>{" "}
                first — family members are tied to a policy.
              </p>
            ) : insurance.dependents.length > 0 ? (
              <ul className="space-y-2">
                {insurance.dependents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between text-sm">
                    <span className="text-brand-dark">
                      {d.full_name} <span className="text-xs text-gray-400 capitalize">({d.relationship})</span>
                    </span>
                    <span className={d.verified ? "text-xs text-green-600" : "text-xs text-amber-600"}>
                      {d.verified ? "Verified" : "Pending"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400">No family members added yet.</p>
            )}
          </SectionCard>

          {/* Salary & Compensation */}
          <SectionCard
            title="Salary & Compensation"
            action={
              latestPayslip && payrollAccess ? (
                <Button
                  variant="secondary"
                  onClick={() => openPayrollEditor(latestPayslip)}
                  className="flex items-center gap-2"
                >
                  <Edit2 size={15} />
                  Edit Salary
                </Button>
              ) : undefined
            }
            unavailable={!payrollAccess}
          >
            {latestPayslip ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Payroll Month"
                    value={new Date(latestPayslip.month).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                    })}
                  />
                  <Field
                    label="Status"
                    value={
                      <span className="capitalize">
                        {latestPayslip.status}
                      </span>
                    }
                  />
                  <Field
                    label="Basic Salary"
                    value={`₹${latestPayslip.basic_pay.toLocaleString("en-IN")}`}
                  />
                  <Field
                    label="Allowances"
                    value={`₹${latestPayslip.allowances.toLocaleString("en-IN")}`}
                  />
                  <Field
                    label="Deductions"
                    value={`₹${latestPayslip.deductions.toLocaleString("en-IN")}`}
                  />
                  <Field
                    label="Net Pay"
                    value={
                      <span className="font-semibold">
                        ₹{latestPayslip.net_pay.toLocaleString("en-IN")}
                      </span>
                    }
                  />
                </div>

                {showPayrollEditor && (
                  <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Edit Salary Details
                        </h4>
                        <p className="text-xs text-gray-500">
                          Net pay is calculated automatically as Basic + Allowances − Deductions.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowPayrollEditor(false)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-white"
                      >
                        <X size={17} />
                      </button>
                    </div>

                    {payrollError && (
                      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {payrollError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label className="text-sm">
                        <span className="mb-1 block font-medium text-gray-700">
                          Payroll Month
                        </span>
                        <input
                          type="date"
                          value={editPayroll.month}
                          onChange={(e) =>
                            setEditPayroll((v) => ({
                              ...v,
                              month: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                        />
                      </label>

                      <label className="text-sm">
                        <span className="mb-1 block font-medium text-gray-700">
                          Basic Salary
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={editPayroll.basicPay}
                          onChange={(e) =>
                            setEditPayroll((v) => ({
                              ...v,
                              basicPay: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                        />
                      </label>

                      <label className="text-sm">
                        <span className="mb-1 block font-medium text-gray-700">
                          Allowances
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={editPayroll.allowances}
                          onChange={(e) =>
                            setEditPayroll((v) => ({
                              ...v,
                              allowances: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                        />
                      </label>

                      <label className="text-sm">
                        <span className="mb-1 block font-medium text-gray-700">
                          Deductions
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={editPayroll.deductions}
                          onChange={(e) =>
                            setEditPayroll((v) => ({
                              ...v,
                              deductions: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                        />
                      </label>
                    </div>

                    <div className="mt-5 flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setShowPayrollEditor(false)}
                        disabled={payrollSaving}
                      >
                        Cancel
                      </Button>

                      <Button
                        onClick={handlePayrollEdit}
                        disabled={payrollSaving}
                        className="flex items-center gap-2"
                      >
                        <Save size={15} />
                        {payrollSaving ? "Saving..." : "Save Salary"}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-400">
                No payroll records yet.
              </p>
            )}
          </SectionCard>

          {/* Leave Details */}
          <SectionCard title="Leave Details">
            {leaveBalances.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {leaveBalances.map((balance) => (
                  <div
                    key={balance.leave_type_id}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {balance.leave_type_name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {balance.annual_quota_days} days/year
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Used</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {balance.days_used}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Remaining</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {balance.days_remaining}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                No leave types configured yet.
              </p>
            )}
          </SectionCard>

          {/* Performance / Output */}
          <SectionCard title="Performance & Output">
            {latestReview ? (
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Latest Rating"
                  value={<span className="capitalize">{latestReview.rating.replace(/_/g, " ")}</span>}
                />
                <Field label="Status" value={<span className="capitalize">{latestReview.status.replace(/_/g, " ")}</span>} />
              </div>
            ) : (
              <p className="text-xs text-gray-400">No performance reviews yet.</p>
            )}
          </SectionCard>

          {/* Benefits / Compliance summary */}
          <SectionCard title="Other Benefits & Compliance">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Documents Verified" value={`${documentsVerified} / ${documents.length}`} />
              <Field label="BGV Cleared" value={`${bgvCleared} / ${bgvChecks.length}`} />
              <Field
                label="Leave Balance"
                value={
                  leaveBalances.length > 0
                    ? leaveBalances.map((b) => `${b.leave_type_name}: ${b.days_remaining}d`).join(", ")
                    : null
                }
              />
              <Field
                label="Attendance (Present)"
                value={attendance ? `${attendance.present} days` : null}
              />
            </div>
          </SectionCard>

          {/* Employee Documents */}
          <SectionCard title="Employee Documents">
            <div className="space-y-3">
              {[
                {
                  type: "joining_letter",
                  label: "Joining Letter",
                },
                {
                  type: "offer_letter",
                  label: "Offer Letter",
                },
                {
                  type: "appraisal_letter",
                  label: "Appraisal Letter",
                },
                {
                  type: "relieving_letter",
                  label: "Relieving Letter",
                },
                {
                  type: "experience_letter",
                  label: "Experience Letter",
                },
              ].map((requiredDoc) => {
                const doc = documents.find(
                  (d) => d.document_type === requiredDoc.type
                );

                return (
                  <div
                    key={requiredDoc.type}
                    className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-dark">
                        {requiredDoc.label}
                      </p>

                      {doc ? (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="truncate text-xs text-gray-500">
                            {doc.file_name}
                          </span>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                              doc.status === "verified"
                                ? "bg-green-50 text-green-600"
                                : doc.status === "rejected"
                                  ? "bg-red-50 text-red-600"
                                  : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {doc.status.replace(/_/g, " ")}
                          </span>
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-gray-400">
                          Not uploaded
                        </p>
                      )}
                    </div>

                    {doc && (
                      <button
                        type="button"
                        onClick={() =>
                          documentService.download(
                            doc.id,
                            doc.file_name
                          )
                        }
                        className="ml-3 shrink-0 text-xs font-medium text-brand hover:underline"
                      >
                        Download
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-md border border-dashed border-gray-200 p-3">
              <p className="text-xs text-gray-500">
                Documents can be uploaded from the Documents module and will
                automatically appear here.
              </p>
            </div>
          </SectionCard>

          {/* Documents */}
          <SectionCard title="Documents">
            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-medium text-brand-dark">
                          {HR_DOCUMENT_LABELS[document.document_type] ??
                            document.document_type.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          {document.file_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={
                            document.status === "verified"
                              ? "rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600"
                              : document.status === "rejected"
                              ? "rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600"
                              : "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600"
                          }
                        >
                          {document.status.replace(/_/g, " ")}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            documentService.download(
                              document.id,
                              document.file_name
                            )
                          }
                          className="text-xs font-medium text-brand hover:underline"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                No employee documents uploaded yet.
              </p>
            )}
          </SectionCard>

          {/* Annual Holiday Calendar */}
          <SectionCard
            title={`Holiday Calendar — ${holidayYear}`}
            action={
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setHolidayYear((y) => y - 1)}
                  disabled={holidayLoading}
                >
                  ←
                </Button>

                <span className="min-w-[60px] text-center text-sm font-medium">
                  {holidayYear}
                </span>

                <Button
                  variant="secondary"
                  onClick={() => setHolidayYear((y) => y + 1)}
                  disabled={holidayLoading}
                >
                  →
                </Button>

                <Button
                  onClick={() => {
                    setEditingHoliday(null);
                    setHolidayName("");
                    setHolidayDate("");
                    setHolidayOptional(false);
                    setHolidayFormOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus size={15} />
                  Add Holiday
                </Button>
              </div>
            }
          >
            {holidayLoading ? (
              <Loader label="Loading holidays..." />
            ) : holidays.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
                No holidays configured for {holidayYear}.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <div className="grid grid-cols-[1fr_150px_120px_90px] bg-surface-muted px-4 py-3 text-xs font-semibold text-gray-500">
                  <span>Holiday</span>
                  <span>Date</span>
                  <span>Type</span>
                  <span className="text-right">Actions</span>
                </div>

                {holidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="grid grid-cols-[1fr_150px_120px_90px] items-center border-t px-4 py-3 text-sm"
                  >
                    <div className="font-medium">
                      {holiday.name}
                    </div>

                    <div className="text-gray-600">
                      {new Date(`${holiday.date}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          holiday.is_optional
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {holiday.is_optional ? "Optional" : "Holiday"}
                      </span>
                    </div>

                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                        title="Edit holiday"
                        onClick={() => {
                          setEditingHoliday(holiday);
                          setHolidayName(holiday.name);
                          setHolidayDate(holiday.date);
                          setHolidayOptional(holiday.is_optional);
                          setHolidayFormOpen(true);
                        }}
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        className="rounded-md p-2 text-red-500 hover:bg-red-50"
                        title="Delete holiday"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `Delete "${holiday.name}"?`
                            )
                          ) {
                            return;
                          }

                          try {
                            await holidayService.delete(holiday.id);
                            setHolidays((current) =>
                              current.filter((h) => h.id !== holiday.id)
                            );
                          } catch (error) {
                            console.error(
                              "Failed to delete holiday:",
                              error
                            );
                            window.alert(
                              "Unable to delete this holiday."
                            );
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Holiday Add/Edit Form */}
            {holidayFormOpen && (
              <div className="mt-4 rounded-lg border bg-surface-muted/40 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">
                    {editingHoliday
                      ? "Edit Holiday"
                      : "Add Holiday"}
                  </h3>

                  <button
                    type="button"
                    onClick={() => setHolidayFormOpen(false)}
                    className="rounded-md p-1 text-gray-500 hover:bg-gray-200"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Holiday Name
                    </label>
                    <input
                      value={holidayName}
                      onChange={(e) =>
                        setHolidayName(e.target.value)
                      }
                      className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                      placeholder="e.g. Republic Day"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Date
                    </label>
                    <input
                      type="date"
                      value={holidayDate}
                      onChange={(e) =>
                        setHolidayDate(e.target.value)
                      }
                      className="w-full rounded-md border bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-7">
                    <input
                      id="holiday-optional"
                      type="checkbox"
                      checked={holidayOptional}
                      onChange={(e) =>
                        setHolidayOptional(e.target.checked)
                      }
                    />
                    <label
                      htmlFor="holiday-optional"
                      className="text-sm"
                    >
                      Optional Holiday
                    </label>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setHolidayFormOpen(false)}
                    disabled={holidaySaving}
                  >
                    Cancel
                  </Button>

                  <Button
                    disabled={
                      holidaySaving ||
                      !holidayName.trim() ||
                      !holidayDate
                    }
                    onClick={async () => {
                      setHolidaySaving(true);

                      try {
                        const payload = {
                          name: holidayName.trim(),
                          date: holidayDate,
                          is_optional: holidayOptional,
                        };

                        if (editingHoliday) {
                          const updated =
                            await holidayService.update(
                              editingHoliday.id,
                              payload
                            );

                          setHolidays((current) =>
                            current.map((h) =>
                              h.id === updated.id
                                ? updated
                                : h
                            )
                          );
                        } else {
                          const created =
                            await holidayService.create(
                              payload
                            );

                          setHolidays((current) =>
                            [...current, created].sort(
                              (a, b) =>
                                a.date.localeCompare(b.date)
                            )
                          );
                        }

                        setHolidayFormOpen(false);
                        setEditingHoliday(null);
                        setHolidayName("");
                        setHolidayDate("");
                        setHolidayOptional(false);
                      } catch (error) {
                        console.error(
                          "Failed to save holiday:",
                          error
                        );
                        window.alert(
                          "Unable to save holiday."
                        );
                      } finally {
                        setHolidaySaving(false);
                      }
                    }}
                  >
                    {holidaySaving
                      ? "Saving..."
                      : editingHoliday
                        ? "Save Changes"
                        : "Add Holiday"}
                  </Button>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Team Tree */}
          <SectionCard
            title="Team Tree"
            action={
              <button
                type="button"
                onClick={() => setTeamOpen((open) => !open)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              >
                {teamOpen ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
            }
          >
            {teamOpen && (
              <>
                {teamLoading ? (
                  <Loader label="Loading team structure..." />
                ) : (
                  <div className="space-y-5">
                    {/* Current employee */}
                    <div className="flex justify-center">
                      <div className="min-w-[240px] rounded-xl border bg-white p-4 text-center shadow-sm">
                        <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted">
                          <UserIcon size={20} />
                        </div>

                        <div className="font-semibold">
                          {employee?.full_name}
                        </div>

                        <div className="text-xs text-gray-500">
                          {employee?.designation}
                        </div>

                        <div className="mt-2 text-xs font-medium text-blue-600">
                          Current Employee
                        </div>
                      </div>
                    </div>

                    {/* Manager */}
                    {teamTree?.manager && (
                      <div>
                        <div className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-gray-400">
                          Reporting Manager
                        </div>

                        <div className="flex justify-center">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/employees/${teamTree.manager!.id}`
                              )
                            }
                            className="min-w-[240px] rounded-xl border bg-white p-4 text-center shadow-sm transition hover:border-blue-400 hover:shadow"
                          >
                            <div className="font-semibold">
                              {teamTree.manager.full_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {teamTree.manager.designation}
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Direct reports */}
                    <div>
                      <div className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-gray-400">
                        Direct Reports
                      </div>

                      {teamTree?.direct_reports?.length ? (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {teamTree.direct_reports.map(
                            (member) => (
                              <button
                                key={member.id}
                                type="button"
                                onClick={() =>
                                  router.push(
                                    `/employees/${member.id}`
                                  )
                                }
                                className="rounded-xl border bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted">
                                    <UserIcon size={17} />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="truncate font-semibold">
                                      {member.full_name}
                                    </div>
                                    <div className="truncate text-xs text-gray-500">
                                      {member.designation}
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                                  <GitBranch size={13} />
                                  {member.department || "No department"}
                                </div>
                              </button>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed p-5 text-center text-sm text-gray-500">
                          No direct reports.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionCard>

          {/* Team */}
          <SectionCard title="Team">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Reporting Manager" value={org?.manager?.full_name ?? "—"} />
              <Field label="Direct Reports" value={org ? org.direct_reports.length : null} />
            </div>
          </SectionCard>
        </div>
      </div>

      {showEditModal && full && (
        <EditPersonalDetailsModal
          employeeId={employeeId}
          existing={full}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => setEmployee(updated)}
        />
      )}
      {showAddDependentModal && (
        <AddDependentModal
          employeeId={employeeId}
          onClose={() => setShowAddDependentModal(false)}
          onAdded={reloadInsurance}
        />
      )}
      {showOffboardModal && (
        <OffboardEmployeeModal
          employeeId={employeeId}
          employeeName={employee.full_name}
          onClose={() => setShowOffboardModal(false)}
          onDone={reloadEmployee}
        />
      )}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {editingProject ? "Edit Project" : "Add Project"}
                </h2>
                <p className="mt-1 text-xs text-gray-400">
                  Manage employee project assignment and details
                </p>
              </div>

              <button
                onClick={() => setShowProjectModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2"
              onSubmit={async (event) => {
                event.preventDefault();
                setProjectSaving(true);
                setProjectError(null);

                const form = new FormData(event.currentTarget);

                const payload = {
                  project_name: String(form.get("project_name") || ""),
                  project_code: String(form.get("project_code") || "") || null,
                  client_name: String(form.get("client_name") || "") || null,
                  role: String(form.get("role") || "") || null,
                  project_manager: String(form.get("project_manager") || "") || null,
                  status: String(form.get("status") || "active"),
                  start_date: String(form.get("start_date") || "") || null,
                  end_date: String(form.get("end_date") || "") || null,
                  allocation_percentage: Number(form.get("allocation_percentage") || 100),
                  technologies: String(form.get("technologies") || "") || null,
                  description: String(form.get("description") || "") || null,
                  responsibilities: String(form.get("responsibilities") || "") || null,
                  achievements: String(form.get("achievements") || "") || null,
                  remarks: String(form.get("remarks") || "") || null,
                };

                try {
                  if (editingProject) {
                    const updated = await projectService.update(
                      editingProject.id,
                      payload
                    );

                    setProjects((current) =>
                      current.map((item) =>
                        item.id === updated.id ? updated : item
                      )
                    );
                  } else {
                    const created = await projectService.create({
                      employee_id: employeeId,
                      ...payload,
                    });

                    setProjects((current) => [created, ...current]);
                  }

                  setShowProjectModal(false);
                  setEditingProject(null);
                } catch (error: any) {
                  setProjectError(
                    error?.response?.data?.detail ||
                    "Unable to save project."
                  );
                } finally {
                  setProjectSaving(false);
                }
              }}
            >
              {[
                ["project_name", "Project Name", editingProject?.project_name],
                ["project_code", "Project Code", editingProject?.project_code],
                ["client_name", "Client", editingProject?.client_name],
                ["role", "Employee Role", editingProject?.role],
                ["project_manager", "Project Manager", editingProject?.project_manager],
                ["start_date", "Start Date", editingProject?.start_date],
                ["end_date", "End Date", editingProject?.end_date],
                ["allocation_percentage", "Allocation %", editingProject?.allocation_percentage ?? 100],
              ].map(([name, label, value]) => (
                <label key={String(name)} className="block">
                  <span className="mb-1.5 block text-xs font-medium text-gray-600">
                    {String(label)}
                  </span>
                  <input
                    name={String(name)}
                    type={
                      name === "allocation_percentage"
                        ? "number"
                        : name === "start_date" || name === "end_date"
                        ? "date"
                        : "text"
                    }
                    defaultValue={value ?? ""}
                    required={name === "project_name"}
                    min={name === "allocation_percentage" ? 0 : undefined}
                    max={name === "allocation_percentage" ? 100 : undefined}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                  />
                </label>
              ))}

              <label className="block">
                <span className="mb-1.5 block text-xs font-medium text-gray-600">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={editingProject?.status || "active"}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="mb-1.5 block text-xs font-medium text-gray-600">
                  Technologies
                </span>
                <input
                  name="technologies"
                  defaultValue={editingProject?.technologies || ""}
                  placeholder="React, FastAPI, PostgreSQL, Docker"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
              </label>

              {[
                ["description", "Description"],
                ["responsibilities", "Responsibilities"],
                ["achievements", "Achievements"],
                ["remarks", "Remarks"],
              ].map(([name, label]) => (
                <label key={name} className="block md:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-gray-600">
                    {label}
                  </span>
                  <textarea
                    name={name}
                    rows={3}
                    defaultValue={
                      editingProject
                        ? (editingProject as any)[name] || ""
                        : ""
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </label>
              ))}

              {projectError && (
                <p className="md:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  {projectError}
                </p>
              )}

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={projectSaving}
                  className="rounded-lg bg-brand px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {projectSaving
                    ? "Saving..."
                    : editingProject
                    ? "Save Changes"
                    : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </>


  );
}
