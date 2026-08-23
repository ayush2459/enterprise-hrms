"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { employeeService } from "@/services/employee.service";
import type { EmployeeFull, EmployeePublic } from "@/types";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
