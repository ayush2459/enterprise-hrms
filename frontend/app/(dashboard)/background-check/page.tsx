"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Loader } from "@/components/common/Loader";
import { employeeService } from "@/services/employee.service";
import { bgvService } from "@/services/bgv.service";
import { useAuthStore } from "@/store/auth.store";
import type { BGVCheck, BGVCheckType, EmployeePublic } from "@/types";
import { usePageSearch } from "@/components/layout/PageSearchContext";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];
const ALL_CHECK_TYPES: BGVCheckType[] = ["education", "employment", "address", "criminal", "reference"];

const STATUS_STYLES: Record<string, string> = {
  cleared: "bg-green-50 text-green-700",
  initiated: "bg-amber-50 text-amber-700",
  in_progress: "bg-blue-50 text-blue-700",
  flagged: "bg-red-50 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default function BackgroundCheckPage() {
  const { query: pageSearchQuery } = usePageSearch();
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [checks, setChecks] = useState<BGVCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    employeeService.list(0, 100).then((list) => {
      setEmployees(list);
      if (list.length > 0) setSelectedEmployeeId(list[0].id);
    });
  }, []);

  const loadChecks = (employeeId: string) => {
    setLoading(true);
    setError(null);
    bgvService
      .listForEmployee(employeeId)
      .then(setChecks)
      .catch(() => setError("Could not load background checks for this employee."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedEmployeeId) loadChecks(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const handleInitiateCheck = async (checkType: BGVCheckType) => {
    try {
      await bgvService.initiate(selectedEmployeeId, checkType);
      loadChecks(selectedEmployeeId);
    } catch {
      setError("Could not initiate that check.");
    }
  };

  const handleUpdateCheck = async (checkId: string, status: BGVCheck["status"]) => {
    try {
      await bgvService.updateStatus(checkId, status);
      loadChecks(selectedEmployeeId);
    } catch {
      setError("Could not update check status.");
    }
  };

  const missingCheckTypes = ALL_CHECK_TYPES.filter((t) => !checks.some((c) => c.check_type === t));

  return (
    <>
      <Topbar title="Background Check" subtitle="Employee background verification pipeline" />
      <div className="p-8 space-y-6">
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

        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading ? (
          <Loader label="Loading background checks..." />
        ) : selectedEmployeeId ? (
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-brand-dark">Background Verification</h2>
              {isHR && missingCheckTypes.length > 0 && (
                <div className="flex gap-2">
                  {missingCheckTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleInitiateCheck(t)}
                      className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-brand hover:text-brand capitalize"
                    >
                      <Plus size={12} />
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Check Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last Updated</th>
                  {isHR && <th className="px-5 py-3 font-medium text-right">Update</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {checks.map((check) => (
                  <tr key={check.id}>
                    <td className="px-5 py-3 font-medium capitalize text-brand-dark">{check.check_type}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={check.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(check.updated_at).toLocaleDateString()}
                    </td>
                    {isHR && (
                      <td className="px-5 py-3 text-right">
                        <select
                          value={check.status}
                          onChange={(e) => handleUpdateCheck(check.id, e.target.value as BGVCheck["status"])}
                          className="rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-brand"
                        >
                          <option value="initiated">Initiated</option>
                          <option value="in_progress">In Progress</option>
                          <option value="cleared">Cleared</option>
                          <option value="flagged">Flagged</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
                {checks.length === 0 && (
                  <tr>
                    <td colSpan={isHR ? 4 : 3} className="px-5 py-8 text-center text-gray-400">
                      No background checks initiated yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card className="py-16 text-center text-gray-400">
            No employees yet — add one from the Employees page first.
          </Card>
        )}
      </div>
    </>
  );
}
