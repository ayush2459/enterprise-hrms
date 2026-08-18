"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Users, Banknote, Clock3 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { AddLeaveTypeModal } from "@/components/leaves/AddLeaveTypeModal";
import { leaveService } from "@/services/leave.service";
import { useAuthStore } from "@/store/auth.store";
import type { LeaveType } from "@/types";
import { usePageSearch } from "@/components/layout/PageSearchContext";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

export default function LeavePoliciesPage() {
  const { query: pageSearchQuery } = usePageSearch();
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await leaveService.listTypes();
      setLeaveTypes(result);
    } catch {
      setError("Could not load leave policies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const q = pageSearchQuery.trim().toLowerCase();

  const filteredLeaveTypes = leaveTypes.filter((lt) => {
    if (!q) return true;
    return [
      lt.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const activeLeaveTypes = filteredLeaveTypes.filter((lt) => lt.is_active);

  if (!isHR) {
    return (
      <>
        <Topbar
          title="Leave Policies"
          subtitle="Organization-wide leave policies"
        />
        <div className="p-8">
          <Card>
            <p className="text-sm text-gray-500">
              Only HR administrators can manage leave policies.
            </p>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Leave Policies"
        subtitle="Organization-wide leave policy configuration"
      />

      <div className="space-y-6 p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-brand-dark">
              Organization Leave Policies
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              Policies automatically apply to all eligible employees based on
              gender and policy configuration.
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} />
            Add Leave Policy
          </Button>
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <Loader label="Loading leave policies..." />
        ) : leaveTypes.length === 0 ? (
          <Card>
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-gray-600">
                No leave policies configured.
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Create the first organization-wide leave policy.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-500">
                {leaveTypes.length} policies configured
              </p>

              <span className="rounded-full bg-green-50 px-3 py-1 text-[10px] font-semibold text-green-600">
                {activeLeaveTypes.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredLeaveTypes.map((lt) => (
                <Card
                  key={lt.id}
                  className={[
                    "relative overflow-hidden",
                    !lt.is_active ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-brand-dark">
                          {lt.name}
                        </h3>

                        {!lt.is_active && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-semibold text-gray-500">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        Organization-wide policy
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setEditingLeaveType(lt)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:border-brand hover:text-brand"
                      title="Edit leave policy"
                    >
                      <Pencil size={14} />
                    </button>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[10px] text-gray-400">
                        Annual Quota
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {lt.annual_quota_days} days
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-[10px] text-gray-400">
                        Eligibility
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {lt.eligibility_gender === "all"
                          ? "Everyone"
                          : lt.eligibility_gender === "female"
                            ? "Female"
                            : "Male"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-600">
                      <Users size={11} />
                      {lt.eligibility_gender === "all"
                        ? "Everyone"
                        : lt.eligibility_gender === "female"
                          ? "Female"
                          : "Male"}
                    </span>

                    <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-600">
                      <Banknote size={11} />
                      {lt.is_paid ? "Paid" : "Unpaid"}
                    </span>

                    <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-[10px] font-medium text-gray-600">
                      <Clock3 size={11} />
                      {lt.min_days}-{lt.max_days} days
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-gray-400">Carry Forward</p>
                      <p className="mt-0.5 font-semibold text-gray-700">
                        {lt.carry_forward_allowed
                          ? `${lt.max_carry_forward_days} days`
                          : "No"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 px-3 py-2">
                      <p className="text-gray-400">Notice</p>
                      <p className="mt-0.5 font-semibold text-gray-700">
                        {lt.advance_notice_days} days
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {lt.requires_document && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-600">
                        Document Required
                      </span>
                    )}

                    {lt.requires_reason && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-600">
                        Reason Required
                      </span>
                    )}

                    {lt.encashment_allowed && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[9px] font-semibold text-green-600">
                        Encashable
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {(showAddModal || editingLeaveType) && (
        <AddLeaveTypeModal
          leaveType={editingLeaveType}
          onClose={() => {
            setShowAddModal(false);
            setEditingLeaveType(null);
          }}
          onSaved={load}
        />
      )}
    </>
  );
}
