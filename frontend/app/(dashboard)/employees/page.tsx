"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { AddEmployeeModal } from "@/components/employees/AddEmployeeModal";
import { employeeService } from "@/services/employee.service";
import type { EmployeePublic } from "@/types";

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadEmployees = () => {
    setLoading(true);
    employeeService
      .list()
      .then(setEmployees)
      .catch(() => setEmployees([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <>
      <Topbar title="Employees" subtitle="Company directory" />
      <div className="p-8">
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <UserPlus size={16} />
            Add Employee
          </Button>
        </div>

        <Card className="p-0 overflow-hidden">
          {loading ? (
            <Loader label="Loading employees..." />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Designation</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => router.push(`/employees/${emp.id}`)}
                    className="cursor-pointer hover:bg-surface-muted"
                  >
                    <td className="px-5 py-3 font-medium text-brand-dark">{emp.full_name}</td>
                    <td className="px-5 py-3 text-gray-600">{emp.department ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600">{emp.designation ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600 capitalize">{emp.status.replace("_", " ")}</td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                      No employees found. Click &quot;Add Employee&quot; to create the first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onCreated={loadEmployees}
        />
      )}
    </>
  );
}
