"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCheck } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { employeeService } from "@/services/employee.service";
import { useAuthStore } from "@/store/auth.store";
import type { EmployeePublic } from "@/types";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

export default function FormerEmployeesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactivatingId, setReactivatingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    employeeService
      .listOffboarded()
      .then(setEmployees)
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleReactivate = async (id: string) => {
    setReactivatingId(id);
    try {
      await employeeService.reactivate(id);
      load();
    } catch {
      // surfaced implicitly by the row staying in the list
    } finally {
      setReactivatingId(null);
    }
  };

  return (
    <>
      <Topbar title="Former Employees" subtitle="People who have resigned or been terminated" />
      <div className="p-8">
        <button
          onClick={() => router.push("/employees")}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-brand"
        >
          <ArrowLeft size={16} />
          Back to Employees
        </button>

        <Card className="p-0 overflow-hidden">
          {loading ? (
            <Loader label="Loading former employees..." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Designation</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Left On</th>
                  {isHR && <th className="px-5 py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface-muted">
                    <td
                      onClick={() => router.push(`/employees/${emp.id}`)}
                      className="cursor-pointer px-5 py-3 font-medium text-brand-dark"
                    >
                      {emp.full_name}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{emp.department ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600">{emp.designation ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                          emp.offboard_reason === "termination"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {emp.offboarded_at ? new Date(emp.offboarded_at).toLocaleDateString() : "—"}
                    </td>
                    {isHR && (
                      <td className="px-5 py-3">
                        <Button
                          variant="secondary"
                          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5"
                          disabled={reactivatingId === emp.id}
                          onClick={() => handleReactivate(emp.id)}
                        >
                          <UserCheck size={12} />
                          {reactivatingId === emp.id ? "Restoring..." : "Reactivate"}
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={isHR ? 6 : 5} className="px-5 py-8 text-center text-gray-400">
                      Nobody has left the company yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}
