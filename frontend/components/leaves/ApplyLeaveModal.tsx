"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { leaveService } from "@/services/leave.service";
import type { LeaveBalance, LeaveType } from "@/types";

function calculateDays(start: string, end: string) {
  if (!start || !end) return 0;

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);

  if (endDate < startDate) return 0;

  return Math.floor(
    (endDate.getTime() - startDate.getTime()) / 86400000
  ) + 1;
}

export function ApplyLeaveModal({
  employeeId,
  employeeGender,
  leaveTypes,
  balances,
  onClose,
  onApplied,
}: {
  employeeId: string;
  employeeGender?: string | null;
  leaveTypes: LeaveType[];
  balances?: LeaveBalance[];
  onClose: () => void;
  onApplied: () => void;
}) {
  const normalizedGender = employeeGender?.trim().toLowerCase() || null;

  const eligibleLeaveTypes = useMemo(() => {
    return leaveTypes.filter((leaveType) => {
      if (leaveType.is_active === false) return false;

      const eligibility = leaveType.eligibility_gender ?? "all";

      // Universal policies are always available.
      if (eligibility === "all") {
        return true;
      }

      // Gender-specific policies require a known employee gender.
      if (!normalizedGender) {
        return false;
      }

      // Support common employee gender values.
      const normalizedEmployeeGender =
        normalizedGender === "m" ||
        normalizedGender === "man" ||
        normalizedGender === "men"
          ? "male"
          : normalizedGender === "f" ||
            normalizedGender === "woman" ||
            normalizedGender === "women"
            ? "female"
            : normalizedGender;

      return eligibility === normalizedEmployeeGender;
    });
  }, [leaveTypes, normalizedGender]);

  const [leaveTypeId, setLeaveTypeId] = useState(
    eligibleLeaveTypes[0]?.id ?? ""
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      !eligibleLeaveTypes.some((leaveType) => leaveType.id === leaveTypeId)
    ) {
      setLeaveTypeId(eligibleLeaveTypes[0]?.id ?? "");
    }
  }, [eligibleLeaveTypes, leaveTypeId]);

  const selectedLeaveType = eligibleLeaveTypes.find(
    (leaveType) => leaveType.id === leaveTypeId
  );

  const selectedBalance = balances?.find(
    (balance) => balance.leave_type_id === leaveTypeId
  );

  const requestedDays = calculateDays(startDate, endDate);

  const validationMessage = useMemo(() => {
    if (!selectedLeaveType || requestedDays === 0) return null;

    if (requestedDays < selectedLeaveType.min_days) {
      return `Minimum ${selectedLeaveType.min_days} day(s) required.`;
    }

    if (requestedDays > selectedLeaveType.max_days) {
      return `Maximum ${selectedLeaveType.max_days} day(s) allowed per request.`;
    }

    if (
      selectedBalance &&
      requestedDays > selectedBalance.days_remaining
    ) {
      return `Only ${selectedBalance.days_remaining} day(s) remaining.`;
    }

    return null;
  }, [requestedDays, selectedLeaveType, selectedBalance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!selectedLeaveType) {
      setError("Please select a valid leave type.");
      return;
    }

    if (requestedDays <= 0) {
      setError("Please select valid dates.");
      return;
    }

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    if (
      selectedLeaveType.requires_reason &&
      !reason.trim()
    ) {
      setError("A reason is required for this leave type.");
      return;
    }

    setLoading(true);

    try {
      await leaveService.apply(
        employeeId,
        leaveTypeId,
        startDate,
        endDate,
        reason
      );

      onApplied();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Could not submit leave request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-brand-dark">
              Apply for Leave
            </h2>
            <p className="mt-0.5 text-[11px] text-gray-400">
              Select an eligible leave policy for this employee.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-brand-dark">
              Leave Type
            </label>

            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              required
            >
              {eligibleLeaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                  {" — "}
                  {lt.is_paid ? "Paid" : "Unpaid"}
                  {" · "}
                  {lt.annual_quota_days} days/year
                </option>
              ))}
            </select>
          </div>

          {selectedLeaveType && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      selectedLeaveType.is_paid
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {selectedLeaveType.is_paid ? "PAID" : "UNPAID"}
                  </span>

                  {selectedLeaveType.eligibility_gender !== "all" && (
                    <span className="rounded-full bg-purple-50 px-2 py-1 text-[10px] font-bold capitalize text-purple-700">
                      {selectedLeaveType.eligibility_gender} only
                    </span>
                  )}
                </div>

                {selectedBalance && (
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400">
                      Remaining
                    </div>
                    <div className="text-sm font-bold text-brand-dark">
                      {selectedBalance.days_remaining} days
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-[10px] text-gray-500">
                <div>
                  <span className="font-semibold text-gray-700">
                    Duration:
                  </span>{" "}
                  {selectedLeaveType.min_days}–{selectedLeaveType.max_days} days
                </div>

                <div>
                  <span className="font-semibold text-gray-700">
                    Notice:
                  </span>{" "}
                  {selectedLeaveType.advance_notice_days === 0
                    ? "No minimum"
                    : `${selectedLeaveType.advance_notice_days} days`}
                </div>
              </div>

              {(selectedLeaveType.requires_reason ||
                selectedLeaveType.requires_document) && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-white p-2.5 text-[10px] text-gray-500">
                  <Info size={13} className="mt-0.5 shrink-0" />

                  <span>
                    {selectedLeaveType.requires_reason &&
                      "Reason required. "}
                    {selectedLeaveType.requires_document &&
                      "Supporting document required."}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              id="start_date"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            <Input
              id="end_date"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {requestedDays > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              <CheckCircle2 size={14} />
              {requestedDays} day{requestedDays === 1 ? "" : "s"} requested
            </div>
          )}

          <Input
            id="reason"
            label={
              selectedLeaveType?.requires_reason
                ? "Reason (required)"
                : "Reason (optional)"
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required={selectedLeaveType?.requires_reason}
          />

          {validationMessage && (
            <p className="text-xs font-medium text-amber-600">
              {validationMessage}
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !!validationMessage}
            >
              {loading ? "Submitting..." : "Apply Leave"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}
