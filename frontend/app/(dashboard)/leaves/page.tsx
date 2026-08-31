"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";

import { Topbar } from "@/components/layout/Topbar";
import { usePageSearch } from "@/components/layout/PageSearchContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { ApplyLeaveModal } from "@/components/leaves/ApplyLeaveModal";

import { employeeService } from "@/services/employee.service";
import { leaveService } from "@/services/leave.service";
import { useAuthStore } from "@/store/auth.store";
import { useRealtime } from "@/hooks/useRealtime";

import type {
  EmployeeFull,
  EmployeePublic,
  LeaveBalance,
  LeaveRequest,
  LeaveType,
} from "@/types";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
};

export default function LeavesPage() {
  useRealtime();

  const { query: pageSearchQuery } = usePageSearch();
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);
  const isManager = !!user && user.role === "reporting_manager";

  // "me" = the logged-in person's own employee record, always loaded so
  // everyone (including HR/managers) can see and apply for their own leave.
  const [me, setMe] = useState<EmployeeFull | null>(null);
  const [meError, setMeError] = useState<string | null>(null);

  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  // HR uses this to browse anyone's leave history; defaults to "me" for
  // everyone else so they never see a confusing company-wide picker.
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  useEffect(() => {
    employeeService
      .getMyProfile()
      .then((profile) => {
        setMe(profile);
        setSelectedEmployeeId((current) => current || profile.id);
      })
      .catch(() => {
        setMeError(
          "No employee profile is linked to your account yet — contact HR."
        );
      });

    if (isHR) {
      employeeService.list(0, 1000, true).then(setEmployees).catch(() => {});
    }

    let cancelled = false;

    const refreshLeaveTypes = async () => {
      try {
        const types = await leaveService.listTypes();
        if (!cancelled) {
          setLeaveTypes(types);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load leave policies.");
        }
      }
    };

    void refreshLeaveTypes();

    const leavePolicyInterval = window.setInterval(() => {
      void refreshLeaveTypes();
    }, 3000);

    return () => {
      cancelled = true;
      window.clearInterval(leavePolicyInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHR]);

  // page-search employee resolver (HR only — searches the full directory)
  useEffect(() => {
    if (!isHR) return;
    const q = pageSearchQuery.trim().toLowerCase();
    if (!q) return;

    // Debounce: wait for typing to pause before resolving + switching
    // employees, so fast typing doesn't fire a fetch per keystroke.
    const timeout = setTimeout(() => {
      const match = employees.find((employee) => {
        const haystack = [
          employee.full_name,
          employee.department,
          employee.designation,
          employee.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });

      if (match && match.id !== selectedEmployeeId) {
        setSelectedEmployeeId(match.id);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [pageSearchQuery, employees, selectedEmployeeId, isHR]);

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Manager's team: direct reports pending approval, pulled from the same
  // "me" record's id matched against reporting_manager_id on the roster.
  const [teamRequests, setTeamRequests] = useState<
    { employee: EmployeePublic; request: LeaveRequest }[]
  >([]);
  const [teamLoading, setTeamLoading] = useState(false);

  // HR: company-wide pending approvals (all employees, not just direct reports)
  const [hrPending, setHrPending] = useState<{ request_id: string; employee_id: string; employee_name: string; department: string | null; designation: string | null; leave_type_id: string; start_date: string; end_date: string; reason: string | null }[]>([]);
  const [hrPendingLoading, setHrPendingLoading] = useState(false);

  const selectedEmployee: EmployeePublic | EmployeeFull | undefined =
    isHR
      ? employees.find((employee) => employee.id === selectedEmployeeId) ??
        (me?.id === selectedEmployeeId ? me : undefined)
      : me ?? undefined;

  const loadRequestIdRef = useRef(0);

  const load = (employeeId: string) => {
    const requestId = ++loadRequestIdRef.current;
    setLoading(true);
    setError(null);

    Promise.all([
      leaveService.listForEmployee(employeeId),
      leaveService.getBalance(employeeId),
    ])
      .then(([reqs, bal]) => {
        if (requestId !== loadRequestIdRef.current) return; // stale response, ignore
        setRequests(reqs);
        setBalances(bal);
      })
      .catch(() => {
        if (requestId !== loadRequestIdRef.current) return;
        setError("Could not load leave requests.");
      })
      .finally(() => {
        if (requestId !== loadRequestIdRef.current) return;
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedEmployeeId) {
      load(selectedEmployeeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployeeId]);

  // Load the manager's team pending-approval queue. Requires the full
  // directory to know who reports to "me" — HR already has this list
  // loaded; managers fetch it just for this purpose.
  useEffect(() => {
    if (!isManager || !me) return;

    setTeamLoading(true);
    employeeService
      .list(0, 1000, false)
      .then(async (all) => {
        const directReports = all.filter(
          (e) => e.reporting_manager_id === me.id
        );
        const results = await Promise.all(
          directReports.map(async (employee) => {
            const reqs = await leaveService.listForEmployee(employee.id);
            return reqs
              .filter((r) => r.status === "pending")
              .map((request) => ({ employee, request }));
          })
        );
        setTeamRequests(results.flat());
      })
      .catch(() => {})
      .finally(() => setTeamLoading(false));
  }, [isManager, me]);

  // HR: company-wide pending approvals list, independent of the manager's
  // team queue and independent of whichever employee is selected below.
  useEffect(() => {
    if (!isHR) return;
    setHrPendingLoading(true);
    leaveService
      .listAllPending()
      .then(setHrPending)
      .catch(() => {})
      .finally(() => setHrPendingLoading(false));
  }, [isHR]);

  // Select the employee behind a pending-approval row and scroll the
  // per-employee detail panel into view so HR can see full context.
  const jumpToEmployee = (employeeId: string) => {
    setSelectedEmployeeId(employeeId);
    document
      .getElementById("employee-view-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDecision = async (
    requestId: string,
    status: "approved" | "rejected",
    reloadEmployeeId?: string
  ) => {
    try {
      await leaveService.decide(requestId, status);
      if (reloadEmployeeId) load(reloadEmployeeId);
      // Refresh the team queue and the HR-wide queue so the acted-on
      // request disappears from both.
      setTeamRequests((prev) => prev.filter((tr) => tr.request.id !== requestId));
      setHrPending((prev) => prev.filter((p) => p.request_id !== requestId));
    } catch {
      setError("Could not update leave request.");
    }
  };

  const leaveTypeName = (id: string) =>
    leaveTypes.find((lt) => lt.id === id)?.name ?? "—";
  const openLeaveDocument = (documentId: string) => {
    window.open(
      `/api/backend/documents/${documentId}/download`,
      "_blank",
      "noopener,noreferrer"
    );
  };


  const viewingSelf = !isHR || selectedEmployeeId === me?.id;

  useEffect(() => {
    const handleRealtime = (event: Event) => {
      const detail = (event as CustomEvent<{ type?: string }>).detail;

      if (detail?.type === "leave_policy_updated") {
        void leaveService.listTypes().then(setLeaveTypes);
      }
    };

    window.addEventListener("hrhub:realtime", handleRealtime);

    return () => {
      window.removeEventListener("hrhub:realtime", handleRealtime);
    };
  }, []);

  return (
    <>
      <Topbar
        title="Leaves"
        subtitle={
          selectedEmployee
            ? viewingSelf
              ? "Your leave requests and balance"
              : `Leave requests for ${selectedEmployee.full_name}`
            : "Employee leave requests"
        }
      />

      <div className="space-y-6 p-8">
        {meError && !isHR && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {meError}
          </p>
        )}

        {/* MANAGER: TEAM APPROVALS QUEUE */}
        {isManager && (
          <Card className="overflow-hidden p-0">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-bold text-brand-dark">
                My Team — Pending Approvals
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Leave requests from your direct reports awaiting your
                decision.
              </p>
            </div>
            {teamLoading ? (
              <Loader label="Loading team requests..." />
            ) : teamRequests.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                No pending requests from your team.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {teamRequests.map(({ employee, request }) => (
                  <div
                    key={request.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-brand-dark">
                        {employee.full_name}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {leaveTypeName(request.leave_type_id)} ·{" "}
                        {new Date(request.start_date).toLocaleDateString()} –{" "}
                        {new Date(request.end_date).toLocaleDateString()}
                        {request.reason ? ` · ${request.reason}` : ""}
                      </p>
                      {request.leave_document_id && (
                        <button
                          type="button"
                          onClick={() =>
                            openLeaveDocument(request.leave_document_id!)
                          }
                          className="mt-2 text-xs font-medium text-brand underline"
                        >
                          View supporting document
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(request.id, "approved")}
                        className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(request.id, "rejected")}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* HR: COMPANY-WIDE PENDING APPROVALS */}
        {isHR && (
          <Card className="overflow-hidden p-0">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-bold text-brand-dark">
                All Pending Approvals
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Leave requests awaiting a decision, across the whole
                company — not just your direct reports.
              </p>
            </div>
            {hrPendingLoading ? (
              <Loader label="Loading pending approvals..." />
            ) : hrPending.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                No pending requests company-wide.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {hrPending.map((item) => (
                  <div
                    key={item.request_id}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => jumpToEmployee(item.employee_id)}
                        className="text-sm font-medium text-brand-dark hover:underline"
                      >
                        {item.employee_name}
                      </button>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {item.department ?? "—"}
                        {item.designation ? ` · ${item.designation}` : ""}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {leaveTypeName(item.leave_type_id)} ·{" "}
                        {new Date(item.start_date).toLocaleDateString()} –{" "}
                        {new Date(item.end_date).toLocaleDateString()}
                        {item.reason ? ` · ${item.reason}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleDecision(
                            item.request_id,
                            "approved",
                            item.employee_id === selectedEmployeeId
                              ? selectedEmployeeId
                              : undefined
                          )
                        }
                        className="rounded-md border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleDecision(
                            item.request_id,
                            "rejected",
                            item.employee_id === selectedEmployeeId
                              ? selectedEmployeeId
                              : undefined
                          )
                        }
                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* EMPLOYEE SELECTOR — HR only */}
        <div
          id="employee-view-panel"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          {isHR ? (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                {me && (
                  <option value={me.id}>{me.full_name} (You)</option>
                )}
                {employees
                  .filter((e) => e.id !== me?.id)
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.full_name}
                    </option>
                  ))}
              </select>
              {selectedEmployee?.gender && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {selectedEmployee.gender}
                </span>
              )}
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-brand-dark">
              {me ? `${me.full_name}'s Leave` : "My Leave"}
            </h2>
          )}

          {selectedEmployeeId && (
            <Button
              onClick={() => setShowApplyModal(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Apply for Leave
            </Button>
          )}
        </div>

        {/* LEAVE BALANCE */}
        {balances.length > 0 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {balances.map((b) => (
              <Card key={b.leave_type_id} className="p-4">
                <p className="text-xs text-gray-400">{b.leave_type_name}</p>
                <p className="mt-1 text-2xl font-semibold text-brand-dark">
                  {b.days_remaining}
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    / {b.annual_quota_days} days left
                  </span>
                </p>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {/* LEAVE REQUESTS */}
        {loading ? (
          <Loader label="Loading leave requests..." />
        ) : (
          <Card className="overflow-hidden p-0">
            <div className="border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-bold text-brand-dark">
                Leave Requests
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                {viewingSelf
                  ? "Your leave history and requests."
                  : "Leave history and requests for the selected employee."}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Leave Type</th>
                    <th className="px-5 py-3 font-medium">Start Date</th>
                    <th className="px-5 py-3 font-medium">End Date</th>
                    <th className="px-5 py-3 font-medium">Days</th>
                    <th className="px-5 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    {isHR && (
                      <th className="px-5 py-3 text-right font-medium">
                        Decision
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {requests.map((request) => {
                    const start = new Date(request.start_date);
                    const end = new Date(request.end_date);
                    const days =
                      Math.floor(
                        (end.getTime() - start.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1;

                    return (
                      <tr key={request.id}>
                        <td className="px-5 py-3 font-medium text-brand-dark">
                          {leaveTypeName(request.leave_type_id)}
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {start.toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {end.toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-gray-600">{days}</td>
                        <td className="px-5 py-3 text-gray-600">
                          {request.reason ?? "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                              STATUS_STYLES[request.status] ??
                              "bg-gray-50 text-gray-600"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        {isHR && (
                          <td className="px-5 py-3 text-right">
                            {request.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() =>
                                    handleDecision(
                                      request.id,
                                      "approved",
                                      selectedEmployeeId
                                    )
                                  }
                                  className="text-xs font-medium text-green-600 hover:underline"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleDecision(
                                      request.id,
                                      "rejected",
                                      selectedEmployeeId
                                    )
                                  }
                                  className="text-xs font-medium text-red-600 hover:underline"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {requests.length === 0 && (
                    <tr>
                      <td
                        colSpan={isHR ? 7 : 6}
                        className="px-5 py-10 text-center text-gray-400"
                      >
                        No leave requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* APPLY LEAVE */}
      {showApplyModal && selectedEmployee && (
        <ApplyLeaveModal
          employeeId={selectedEmployee.id}
          employeeGender={selectedEmployee.gender ?? null}
          leaveTypes={leaveTypes}
          onClose={() => setShowApplyModal(false)}
          onApplied={() => {
            setShowApplyModal(false);
            load(selectedEmployee.id);
          }}
        />
      )}
    </>
  );
}
