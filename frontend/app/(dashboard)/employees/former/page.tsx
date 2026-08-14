"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCheck, RefreshCw } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { employeeService } from "@/services/employee.service";
import { useAuthStore } from "@/store/auth.store";
import type { EmployeePublic } from "@/types";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

const LEAVING_TYPES: Record<string, string> = {
  resignation: "Resignation",
  termination: "Termination",
  contract_end: "Contract End",
  retirement: "Retirement",
  abandonment: "Abandonment",
  other: "Other",
};

function leavingType(reason: EmployeePublic["offboard_reason"]) {
  if (!reason) return "Not specified";
  return LEAVING_TYPES[reason] ?? reason.replace(/_/g, " ");
}

function formatDate(value: string | null) {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function FormerEmployeesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const load = async (initial = false) => {
    if (initial) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      /*
       * IMPORTANT:
       * This page uses ONLY live backend data.
       * No employee, date, leaving type, or seed data is created here.
       */
      const data = await employeeService.listOffboarded(50);
      setEmployees(data);
    } catch (error) {
      console.error("Failed to load former employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load(true);

    // Keep the former-employee list synchronized with backend data.
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load(false);
      }
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        load(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  const handleReactivate = async (id: string) => {
    setReactivatingId(id);

    try {
      await employeeService.reactivate(id);
      await load(false);
    } catch (error) {
      console.error("Failed to reactivate employee:", error);
    } finally {
      setReactivatingId(null);
    }
  };

  return (
    <>
      <Topbar
        title="Former Employees"
        subtitle="People who have resigned or been terminated"
      />

      <div className="p-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/employees")}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand"
          >
            <ArrowLeft size={16} />
            Back to Employees
          </button>

          <button
            onClick={() => load(false)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <Card className="overflow-hidden p-0">
          {loading ? (
            <Loader label="Loading former employees..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Department</th>
                    <th className="px-5 py-3 font-medium">Designation</th>
                    <th className="px-5 py-3 font-medium">
                      Type of Leaving
                    </th>
                    <th className="px-5 py-3 font-medium">Left On</th>
                    {isHR && (
                      <th className="px-5 py-3 font-medium">Actions</th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="transition hover:bg-surface-muted"
                    >
                      <td
                        onClick={() =>
                          router.push(`/employees/${emp.id}`)
                        }
                        className="cursor-pointer px-5 py-4 font-semibold text-brand-dark hover:underline"
                      >
                        {emp.full_name}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {emp.department ?? "—"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {emp.designation ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            emp.offboard_reason === "termination"
                              ? "bg-red-50 text-red-600"
                              : emp.offboard_reason === "resignation"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {leavingType(emp.offboard_reason)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {formatDate(emp.offboarded_at)}
                      </td>

                      {isHR && (
                        <td className="px-5 py-4">
                          <Button
                            variant="secondary"
                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs"
                            disabled={reactivatingId === emp.id}
                            onClick={() => handleReactivate(emp.id)}
                          >
                            <UserCheck size={12} />
                            {reactivatingId === emp.id
                              ? "Restoring..."
                              : "Reactivate"}
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}

                  {employees.length === 0 && (
                    <tr>
                      <td
                        colSpan={isHR ? 6 : 5}
                        className="px-5 py-12 text-center"
                      >
                        <p className="font-medium text-gray-500">
                          No former employees found
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Former employees will appear here automatically
                          when their live backend status becomes offboarded.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <p className="mt-3 text-[10px] text-gray-400">
          Live data · Automatically refreshed every 10 seconds
        </p>
      </div>
    </>
  );
}
