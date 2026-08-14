"use client";

import { useEffect, useState } from "react";
import { X, Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { leaveService } from "@/services/leave.service";
import type { LeaveType, LeaveTypePayload } from "@/types";

const DEFAULT_POLICY: LeaveTypePayload = {
  name: "",
  annual_quota_days: 12,
  eligibility_gender: "all",
  is_paid: true,
  carry_forward_allowed: false,
  max_carry_forward_days: 0,
  encashment_allowed: false,
  requires_document: false,
  requires_reason: false,
  min_days: 1,
  max_days: 365,
  advance_notice_days: 0,
  is_active: true,
};

export function AddLeaveTypeModal({
  leaveType,
  onClose,
  onSaved,
}: {
  leaveType?: LeaveType | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<LeaveTypePayload>(
    leaveType
      ? {
          name: leaveType.name,
          annual_quota_days: leaveType.annual_quota_days,
          eligibility_gender: leaveType.eligibility_gender,
          is_paid: leaveType.is_paid,
          carry_forward_allowed: leaveType.carry_forward_allowed,
          max_carry_forward_days: leaveType.max_carry_forward_days,
          encashment_allowed: leaveType.encashment_allowed,
          requires_document: leaveType.requires_document,
          requires_reason: leaveType.requires_reason,
          min_days: leaveType.min_days,
          max_days: leaveType.max_days,
          advance_notice_days: leaveType.advance_notice_days,
          is_active: leaveType.is_active,
        }
      : DEFAULT_POLICY
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leaveType) return;

    setForm({
      name: leaveType.name,
      annual_quota_days: leaveType.annual_quota_days,
      eligibility_gender: leaveType.eligibility_gender,
      is_paid: leaveType.is_paid,
      carry_forward_allowed: leaveType.carry_forward_allowed,
      max_carry_forward_days: leaveType.max_carry_forward_days,
      encashment_allowed: leaveType.encashment_allowed,
      requires_document: leaveType.requires_document,
      requires_reason: leaveType.requires_reason,
      min_days: leaveType.min_days,
      max_days: leaveType.max_days,
      advance_notice_days: leaveType.advance_notice_days,
      is_active: leaveType.is_active,
    });
  }, [leaveType]);

  const update = <K extends keyof LeaveTypePayload>(
    key: K,
    value: LeaveTypePayload[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.max_days < form.min_days) {
      setError("Maximum leave duration cannot be less than minimum duration.");
      return;
    }

    if (
      form.carry_forward_allowed &&
      form.max_carry_forward_days < 0
    ) {
      setError("Maximum carry-forward days cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      if (leaveType) {
        await leaveService.updateType(leaveType.id, form);
      } else {
        await leaveService.createType(form);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          `Could not ${leaveType ? "update" : "create"} leave policy.`
      );
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-brand-dark">{label}</p>
        <p className="mt-0.5 text-[11px] text-gray-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-brand" : "bg-gray-300",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow transition",
            checked ? "left-6" : "left-1",
          ].join(" ")}
        />
      </button>
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Settings2 size={18} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-brand-dark">
                {leaveType ? "Edit Leave Policy" : "Create Leave Policy"}
              </h2>
              <p className="text-[11px] text-gray-400">
                Configure eligibility, entitlement and approval rules
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">

          {/* BASIC */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Basic Policy
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="leave_type_name"
                label="Leave Name"
                placeholder="e.g. Casual Leave"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                required
              />

              <Input
                id="annual_quota"
                label="Annual Quota (days)"
                type="number"
                min={0}
                value={form.annual_quota_days}
                onChange={(e) =>
                  update("annual_quota_days", Number(e.target.value))
                }
                required
              />
            </div>
          </section>

          {/* ELIGIBILITY */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Eligibility
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                ["all", "Everyone"],
                ["male", "Male"],
                ["female", "Female"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    update(
                      "eligibility_gender",
                      value as "all" | "male" | "female"
                    )
                  }
                  className={[
                    "rounded-xl border px-3 py-3 text-sm font-medium transition",
                    form.eligibility_gender === value
                      ? "border-brand bg-brand/5 text-brand"
                      : "border-gray-200 text-gray-500 hover:border-gray-300",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* PAYMENT */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Payment & Entitlement
            </h3>

            <div className="space-y-2">
              <Toggle
                label="Paid Leave"
                description="Employee receives normal salary during this leave."
                checked={form.is_paid}
                onChange={(value) => update("is_paid", value)}
              />

              <Toggle
                label="Carry Forward"
                description="Unused balance can move into the next leave year."
                checked={form.carry_forward_allowed}
                onChange={(value) => update("carry_forward_allowed", value)}
              />

              {form.carry_forward_allowed && (
                <Input
                  id="max_carry_forward"
                  label="Maximum Carry Forward (days)"
                  type="number"
                  min={0}
                  value={form.max_carry_forward_days}
                  onChange={(e) =>
                    update(
                      "max_carry_forward_days",
                      Number(e.target.value)
                    )
                  }
                />
              )}

              <Toggle
                label="Encashment Allowed"
                description="Unused eligible leave can be converted to payment."
                checked={form.encashment_allowed}
                onChange={(value) =>
                  update("encashment_allowed", value)
                }
              />
            </div>
          </section>

          {/* REQUIREMENTS */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Requirements
            </h3>

            <div className="space-y-2">
              <Toggle
                label="Document Required"
                description="Employee must attach supporting documentation."
                checked={form.requires_document}
                onChange={(value) =>
                  update("requires_document", value)
                }
              />

              <Toggle
                label="Reason Required"
                description="Employee must provide a reason when applying."
                checked={form.requires_reason}
                onChange={(value) =>
                  update("requires_reason", value)
                }
              />
            </div>
          </section>

          {/* DURATION */}
          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
              Duration & Notice
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                id="min_days"
                label="Minimum Days"
                type="number"
                min={1}
                value={form.min_days}
                onChange={(e) =>
                  update("min_days", Number(e.target.value))
                }
              />

              <Input
                id="max_days"
                label="Maximum Days"
                type="number"
                min={1}
                value={form.max_days}
                onChange={(e) =>
                  update("max_days", Number(e.target.value))
                }
              />

              <Input
                id="advance_notice"
                label="Advance Notice (days)"
                type="number"
                min={0}
                value={form.advance_notice_days}
                onChange={(e) =>
                  update(
                    "advance_notice_days",
                    Number(e.target.value)
                  )
                }
              />
            </div>
          </section>

          {/* ACTIVE */}
          <section>
            <Toggle
              label="Policy Active"
              description="Inactive policies cannot be selected for new leave requests."
              checked={form.is_active}
              onChange={(value) => update("is_active", value)}
            />
          </section>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2 border-t border-gray-100 pt-4">
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
              className="flex-1 flex items-center justify-center gap-2"
              disabled={loading}
            >
              <Save size={15} />
              {loading
                ? "Saving..."
                : leaveType
                  ? "Save Changes"
                  : "Create Policy"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
