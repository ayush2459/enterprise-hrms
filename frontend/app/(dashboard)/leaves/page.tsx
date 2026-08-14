"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Users, Banknote, Clock3 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { ApplyLeaveModal } from "@/components/leaves/ApplyLeaveModal";
import { AddLeaveTypeModal } from "@/components/leaves/AddLeaveTypeModal";
import { employeeService } from "@/services/employee.service";
import { leaveService } from "@/services/leave.service";
import { useAuthStore } from "@/store/auth.store";
import type { EmployeePublic, LeaveRequest, LeaveType } from "@/types";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];
const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
};

export default function LeavesPage() {
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [editingLeaveType, setEditingLeaveType] = useState<LeaveType | null>(null);

  const selectedEmployee = employees.find(
    (employee) => employee.id === selectedEmployeeId
  );

  const loadLeaveTypes = () => {
    leaveService.listTypes().then(setLeaveTypes);
  };

  const activeLeaveTypes = leaveTypes.filter((lt) => lt.is_active);

  useEffect(() => {
    employeeService.list(0, 100).then((list) => {
      setEmployees(list);
      if (list.length > 0) setSelectedEmployeeId(list[0].id);
    });
    leaveService.listTypes().then(setLeaveTypes);
  }, []);

  const load = (employeeId: string) => {
    setLoading(true);
    setError(null);

    leaveService
      .listForEmployee(employeeId)
      .then(setRequests)
      .catch(() => setError("Could not load leave requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedEmployeeId) load(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const handleDecision = async (requestId: string, status: "approved" | "rejected") => {
    try {
      await leaveService.decide(requestId, status);
      load(selectedEmployeeId);
    } catch {
      setError("Could not update leave request.");
    }
  };

  const leaveTypeName = (id: string) => leaveTypes.find((lt) => lt.id === id)?.name ?? "—";

  return (
    <>
      <Topbar title="Leaves" subtitle="Leave balance & requests" />
      <div className="p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            {isHR && (
              <Button variant="secondary" onClick={() => setShowAddTypeModal(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Add Leave Type
              </Button>
            )}
            {selectedEmployeeId && leaveTypes.length > 0 && (
              <Button onClick={() => setShowApplyModal(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Apply for Leave
              </Button>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {leaveTypes.length === 0 && (
          <p className="text-sm text-amber-600">
            {isHR
              ? "No leave types configured yet. Click \"Add Leave Type\" above to create one."
              : "No leave types configured yet. Ask HR to add one."}
          </p>
        )}

        {isHR && leaveTypes.length > 0 && (
          <section>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-sm font-bold text-brand-dark">
                  Leave Policies
                </h2>
                <p className="text-[11px] text-gray-400">
                  Configure eligibility, paid status, entitlement and leave rules
                </p>
              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-500">
                {activeLeaveTypes.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {leaveTypes.map((lt) => (
                <Card
                  key={lt.id}
                  className={[
                    "relative overflow-hidden transition",
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
                        {lt.annual_quota_days} days / year
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

                  <div className="mt-4 flex flex-wrap gap-2">
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
                        Document
                      </span>
                    )}

                    {lt.requires_reason && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-600">
                        Reason required
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
          </section>
        )}

        {loading ? (
          <Loader label="Loading leave data..." />
        ) : (
          <>
            <Card className="p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Dates</th>
                    <th className="px-5 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    {isHR && <th className="px-5 py-3 font-medium text-right">Decision</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3 font-medium text-brand-dark">{leaveTypeName(r.leave_type_id)}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {new Date(r.start_date).toLocaleDateString()} – {new Date(r.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{r.reason ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      {isHR && (
                        <td className="px-5 py-3 text-right">
                          {r.status === "pending" && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleDecision(r.id, "approved")}
                                className="text-xs font-medium text-green-600 hover:underline"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDecision(r.id, "rejected")}
                                className="text-xs font-medium text-red-600 hover:underline"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={isHR ? 5 : 4} className="px-5 py-8 text-center text-gray-400">
                        No leave requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </div>

      {showApplyModal && (
        <ApplyLeaveModal
          employeeId={selectedEmployeeId}
          employeeGender={selectedEmployee?.gender ?? null}
          leaveTypes={leaveTypes}
          onClose={() => setShowApplyModal(false)}
          onApplied={() => load(selectedEmployeeId)}
        />
      )}
      {(showAddTypeModal || editingLeaveType) && (
        <AddLeaveTypeModal
          leaveType={editingLeaveType}
          onClose={() => {
            setShowAddTypeModal(false);
            setEditingLeaveType(null);
          }}
          onSaved={loadLeaveTypes}
        />
      )}
    </>
  );
}
