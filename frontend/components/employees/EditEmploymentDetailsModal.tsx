"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { employeeService } from "@/services/employee.service";
import type { EmployeeFull, EmployeePublic } from "@/types";

const ROLE_OPTIONS = [
  { value: "employee", label: "Employee" },
  { value: "reporting_manager", label: "Reporting Manager" },
  { value: "hr_executive", label: "HR Executive" },
  { value: "hr_admin", label: "HR Admin" },
  { value: "system_admin", label: "System Admin" },
];

export function EditEmploymentDetailsModal({
  employeeId,
  existing,
  onClose,
  onSaved,
}: {
  employeeId: string;
  existing: EmployeeFull | EmployeePublic;
  onClose: () => void;
  onSaved: (updated: EmployeeFull | EmployeePublic) => void;
}) {
  const [department, setDepartment] = useState(existing.department ?? "");
  const [designation, setDesignation] = useState(existing.designation ?? "");
  const [employmentType, setEmploymentType] = useState<"full_time" | "intern" | "contract">(
    (existing.employment_type as "full_time" | "intern" | "contract") ?? "full_time"
  );
  const [dateOfJoining, setDateOfJoining] = useState(existing.date_of_joining ?? "");
  const [noticePeriodDays, setNoticePeriodDays] = useState(
    existing.notice_period_days != null ? String(existing.notice_period_days) : ""
  );
  const [role, setRole] = useState(existing.role ?? "employee");
  const [reportingManagerId, setReportingManagerId] = useState(
    existing.reporting_manager_id ?? ""
  );
  const [managers, setManagers] = useState<EmployeePublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Populate the Reporting Manager dropdown from real employees — anyone
    // currently a manager, plus whoever's already assigned (in case their
    // role changed since), so the dropdown never shows a blank/broken value.
    employeeService.list(0, 1000, true).then((all) => {
      setManagers(
        all.filter(
          (e) =>
            e.role === "reporting_manager" ||
            e.id === reportingManagerId ||
            e.id !== employeeId
        )
      );
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const updated = await employeeService.update(employeeId, {
        department: department || null,
        designation: designation || null,
        employment_type: employmentType,
        date_of_joining: dateOfJoining || null,
        notice_period_days: noticePeriodDays ? parseInt(noticePeriodDays, 10) : null,
        role,
        reporting_manager_id: reportingManagerId || null,
      } as any);
      onSaved(updated as EmployeeFull | EmployeePublic);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not save employment details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">Edit Employment Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Official Email</label>
            <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-600">
              {(existing as any).official_email ?? "—"}
            </p>
          </div>
          <Input
            id="department"
            label="Department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
          <Input
            id="designation"
            label="Position / Designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-dark">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as "full_time" | "intern" | "contract")}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              <option value="full_time">Full Time</option>
              <option value="intern">Intern</option>
              <option value="contract">Contract</option>
            </select>
          </div>
          <Input
            id="date_of_joining"
            label="Date of Joining"
            type="date"
            value={dateOfJoining}
            onChange={(e) => setDateOfJoining(e.target.value)}
          />
          <Input
            id="notice_period_days"
            label="Notice Period (days)"
            type="number"
            value={noticePeriodDays}
            onChange={(e) => setNoticePeriodDays(e.target.value)}
          />

          <div className="border-t border-gray-100 pt-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-dark">
                Role — controls which workspace they see (Employee / Manager / HR)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400">
                Promoting someone to "Reporting Manager" gives them the Manager Workspace with
                approval access to whoever reports to them.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-dark">Reporting Manager</label>
              <select
                value={reportingManagerId}
                onChange={(e) => setReportingManagerId(e.target.value)}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                <option value="">— No manager assigned —</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name}
                    {m.role === "reporting_manager" ? " (Manager)" : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400">
                This appears live in the manager's "My Team" list and pending-approvals queue.
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
