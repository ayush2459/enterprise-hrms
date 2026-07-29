"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { employeeService } from "@/services/employee.service";
import type { EmployeeCreateInput, EmployeeCreateResult } from "@/types";

interface AddEmployeeModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const EMPTY_FORM: EmployeeCreateInput = {
  full_name: "",
  official_email: "",
  employee_id: "",
  department: "",
  designation: "",
  employment_type: "full_time",
  date_of_joining: "",
  notice_period_days: undefined,
};

export function AddEmployeeModal({ onClose, onCreated }: AddEmployeeModalProps) {
  const [form, setForm] = useState<EmployeeCreateInput>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmployeeCreateResult | null>(null);
  const [copied, setCopied] = useState(false);

  const update = (field: keyof EmployeeCreateInput) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateNoticePeriod = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, notice_period_days: val === "" ? undefined : Number(val) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload: EmployeeCreateInput = {
        ...form,
        employee_id: form.employee_id || undefined,
        department: form.department || undefined,
        designation: form.designation || undefined,
        date_of_joining: form.date_of_joining || undefined,
      };
      const created = await employeeService.create(payload);
      setResult(created);
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not create employee.");
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.temporary_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">
            {result ? "Employee Created" : "Add Employee"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="space-y-4 px-6 py-5">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-brand-dark">{result.full_name}</span> can now
              sign in with the credentials below. Share this password securely — it won&apos;t be
              shown again.
            </p>
            <div className="rounded-md bg-surface-muted p-3 text-sm">
              <div className="mb-1 text-gray-500">Official Email</div>
              <div className="mb-3 font-medium text-brand-dark">{result.official_email}</div>
              <div className="mb-1 text-gray-500">Temporary Password</div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-medium text-brand-dark">
                  {result.temporary_password}
                </span>
                <button
                  onClick={copyPassword}
                  className="flex items-center gap-1 text-xs text-brand hover:underline"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            <Input
              id="full_name"
              label="Full Name"
              value={form.full_name}
              onChange={update("full_name")}
              required
            />
            <Input
              id="official_email"
              label="Official Email"
              type="email"
              value={form.official_email}
              onChange={update("official_email")}
              required
            />
            <Input
              id="employee_id"
              label="Employee ID (optional)"
              value={form.employee_id}
              onChange={update("employee_id")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="department"
                label="Department"
                value={form.department}
                onChange={update("department")}
              />
              <Input
                id="designation"
                label="Designation"
                value={form.designation}
                onChange={update("designation")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-dark">Employment Type</label>
              <select
                value={form.employment_type}
                onChange={update("employment_type")}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                <option value="full_time">Full-time</option>
                <option value="intern">Intern</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <Input
              id="notice_period_days"
              label="Notice Period (days, optional)"
              type="number"
              min="0"
              value={form.notice_period_days ?? ""}
              onChange={updateNoticePeriod}
            />
            <Input
              id="date_of_joining"
              label="Date of Joining"
              type="date"
              value={form.date_of_joining}
              onChange={update("date_of_joining")}
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? "Creating..." : "Create Employee"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
