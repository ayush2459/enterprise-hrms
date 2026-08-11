"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Plus, User as UserIcon, UserX, UserCheck } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { EditPersonalDetailsModal } from "@/components/employees/EditPersonalDetailsModal";
import { OffboardEmployeeModal } from "@/components/employees/OffboardEmployeeModal";
import { AddDependentModal } from "@/components/insurance/AddDependentModal";
import { employeeService } from "@/services/employee.service";
import { teamService } from "@/services/team.service";
import { insuranceService } from "@/services/insurance.service";
import { payrollService } from "@/services/payroll.service";
import { performanceService } from "@/services/performance.service";
import { attendanceService } from "@/services/attendance.service";
import { leaveService } from "@/services/leave.service";
import { documentService } from "@/services/document.service";
import { bgvService } from "@/services/bgv.service";
import { useAuthStore } from "@/store/auth.store";
import type {
  AttendanceSummary,
  BGVCheck,
  DocumentRecord,
  EmployeeFull,
  EmployeePublic,
  InsuranceFull,
  LeaveBalance,
  OrgSnippet,
  PayrollRecord,
  PerformanceReview,
} from "@/types";

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
  const [insuranceAccess, setInsuranceAccess] = useState(true);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [payrollAccess, setPayrollAccess] = useState(true);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [bgvChecks, setBgvChecks] = useState<BGVCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [conversionActionLoading, setConversionActionLoading] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);

  const reloadEmployee = () => {
    employeeService.getById(employeeId).then(setEmployee);
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
    teamService.getOrgSnippet(employeeId).then(setOrg).catch(() => setOrg(null));

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
  const isSeparated = employee.status === "resigned" || employee.status === "terminated";

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
                  {employee.status} {employee.separation_date && `on ${new Date(employee.separation_date).toLocaleDateString()}`}
                </p>
                {employee.separation_reason && (
                  <p className="mt-1 text-xs text-red-600">{employee.separation_reason}</p>
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
              <div className="grid grid-cols-2 gap-4">
                <Field label="Full Name" value={full.full_name} />
                <Field label="Age" value={age !== null ? `${age} years` : null} />
                <Field label="Gender" value={full.gender} />
                <Field label="Blood Group" value={full.blood_group} />
                <Field label="Personal Email" value={full.personal_email} />
                <Field label="Emergency Contact" value={full.emergency_contact} />
                <Field label="Address" value={full.personal_address} />
              </div>
            )}
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

          {/* Payroll */}
          <SectionCard title="Payroll" unavailable={!payrollAccess}>
            {latestPayslip ? (
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Latest Month"
                  value={new Date(latestPayslip.month).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                  })}
                />
                <Field label="Net Pay" value={`₹${latestPayslip.net_pay.toLocaleString()}`} />
                <Field label="Basic Pay" value={`₹${latestPayslip.basic_pay.toLocaleString()}`} />
                <Field label="Status" value={<span className="capitalize">{latestPayslip.status}</span>} />
              </div>
            ) : (
              <p className="text-xs text-gray-400">No payroll records yet.</p>
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
          onSaved={reloadEmployee}
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
    </>
  );
}
