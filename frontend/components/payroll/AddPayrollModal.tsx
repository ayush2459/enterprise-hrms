"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { payrollService } from "@/services/payroll.service";

export function AddPayrollModal({
  employeeId,
  onClose,
  onAdded,
}: {
  employeeId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [month, setMonth] = useState("");
  const [basicPay, setBasicPay] = useState("");
  const [allowances, setAllowances] = useState("0");
  const [deductions, setDeductions] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await payrollService.createRecord(
        employeeId,
        month,
        parseInt(basicPay, 10) || 0,
        parseInt(allowances, 10) || 0,
        parseInt(deductions, 10) || 0
      );
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not add payroll record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">Add Payroll Record</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Input id="month" label="Month" type="date" value={month} onChange={(e) => setMonth(e.target.value)} required />
          <Input id="basic_pay" label="Basic Pay" type="number" value={basicPay} onChange={(e) => setBasicPay(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input id="allowances" label="Allowances" type="number" value={allowances} onChange={(e) => setAllowances(e.target.value)} />
            <Input id="deductions" label="Deductions" type="number" value={deductions} onChange={(e) => setDeductions(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
