"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { ApplyLeaveModal } from "@/components/leaves/ApplyLeaveModal";
import { AddLeaveTypeModal } from "@/components/leaves/AddLeaveTypeModal";
import { employeeService } from "@/services/employee.service";
import { leaveService } from "@/services/leave.service";
import { useAuthStore } from "@/store/auth.store";
import type { EmployeePublic, LeaveBalance, LeaveRequest, LeaveType } from "@/types";

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
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);

  const loadLeaveTypes = () => {
    leaveService.listTypes().then(setLeaveTypes);
  };

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
    Promise.all([leaveService.listForEmployee(employeeId), leaveService.getBalance(employeeId)])
      .then(([reqs, bals]) => {
        setRequests(reqs);
        setBalances(bals);
      })
      .catch(() => setError("Could not load leave data."))
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
              ? "No leave types configured yet. Click \"Add Leave Type\" above to create one (e.g. Casual, Sick, Earned)."
              : "No leave types configured yet. Ask HR to add one."}
          </p>
        )}

        {loading ? (
          <Loader label="Loading leave data..." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {balances.map((b) => (
                <Card key={b.leave_type_id}>
                  <p className="text-xs text-gray-500">{b.leave_type_name}</p>
                  <p className="mt-1 text-2xl font-semibold text-brand-dark">
                    {b.days_remaining} <span className="text-sm font-normal text-gray-400">/ {b.annual_quota_days} days left</span>
                  </p>
                </Card>
              ))}
            </div>

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
          leaveTypes={leaveTypes}
          onClose={() => setShowApplyModal(false)}
          onApplied={() => load(selectedEmployeeId)}
        />
      )}
      {showAddTypeModal && (
        <AddLeaveTypeModal
          onClose={() => setShowAddTypeModal(false)}
          onCreated={loadLeaveTypes}
        />
      )}
    </>
  );
}
