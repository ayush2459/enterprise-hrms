"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { ApplyLeaveModal } from "@/components/leaves/ApplyLeaveModal";

import { employeeService } from "@/services/employee.service";
import { leaveService } from "@/services/leave.service";
import { useAuthStore } from "@/store/auth.store";

import type {
  EmployeePublic,
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
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const selectedEmployee = employees.find(
    (employee) => employee.id === selectedEmployeeId
  );

  useEffect(() => {
    employeeService
      .list(0, 100)
      .then((list) => {
        setEmployees(list);

        if (list.length > 0) {
          setSelectedEmployeeId(list[0].id);
        }
      })
      .catch(() => {
        setError("Could not load employees.");
      });

    leaveService
      .listTypes()
      .then(setLeaveTypes)
      .catch(() => {
        setError("Could not load leave policies.");
      });
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
    if (selectedEmployeeId) {
      load(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const handleDecision = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      await leaveService.decide(requestId, status);
      load(selectedEmployeeId);
    } catch {
      setError("Could not update leave request.");
    }
  };

  const leaveTypeName = (id: string) =>
    leaveTypes.find((lt) => lt.id === id)?.name ?? "—";

  return (
    <>
      <Topbar
        title="Leaves"
        subtitle={
          selectedEmployee
            ? `Leave requests for ${selectedEmployee.full_name}`
            : "Employee leave requests"
        }
      />

      <div className="space-y-6 p-8">

        {/* EMPLOYEE SELECTOR */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">
              Employee
            </label>

            <select
              value={selectedEmployeeId}
              onChange={(e) =>
                setSelectedEmployeeId(e.target.value)
              }
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
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

        {/* EMPLOYEE SUMMARY */}
        {selectedEmployee && (
          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400">
                  Employee
                </p>

                <h2 className="mt-1 text-lg font-semibold text-brand-dark">
                  {selectedEmployee.full_name}
                </h2>
              </div>

            </div>
          </Card>
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
                Leave history and requests for the selected employee.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">
                      Leave Type
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Start Date
                    </th>

                    <th className="px-5 py-3 font-medium">
                      End Date
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Days
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Reason
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>

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
                          {leaveTypeName(
                            request.leave_type_id
                          )}
                        </td>

                        <td className="px-5 py-3 text-gray-600">
                          {start.toLocaleDateString()}
                        </td>

                        <td className="px-5 py-3 text-gray-600">
                          {end.toLocaleDateString()}
                        </td>

                        <td className="px-5 py-3 text-gray-600">
                          {days}
                        </td>

                        <td className="px-5 py-3 text-gray-600">
                          {request.reason ?? "—"}
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                              STATUS_STYLES[
                                request.status
                              ] ?? "bg-gray-50 text-gray-600"
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
                                      "approved"
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
                                      "rejected"
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
                        No leave requests for this employee.
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
