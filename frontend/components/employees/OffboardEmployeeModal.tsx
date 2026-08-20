"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { employeeService } from "@/services/employee.service";

export function OffboardEmployeeModal({
  employeeId,
  employeeName,
  onClose,
  onDone,
}: {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [separationType, setSeparationType] = useState<"resignation" | "termination">("resignation");
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await employeeService.offboard(
        employeeId,
        separationType
      );
      onDone();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not update this employee's status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">Mark as Left the Company</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-700">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              This removes <strong>{employeeName}</strong> from the active directory and dashboard,
              and immediately revokes their login. You can undo this from their profile later if
              needed.
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-dark">Reason for Leaving</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSeparationType("resignation")}
                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  separationType === "resignation"
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Resigned
              </button>
              <button
                type="button"
                onClick={() => setSeparationType("termination")}
                className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                  separationType === "termination"
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                Terminated / Fired
              </button>
            </div>
          </div>

          <Input
            id="effective_date"
            label="Effective Date"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-dark">Notes (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. resigned for a new opportunity, policy violation, role eliminated..."
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Confirm"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
