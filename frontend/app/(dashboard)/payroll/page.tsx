"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { usePageSearch } from "@/components/layout/PageSearchContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { AddPayrollModal } from "@/components/payroll/AddPayrollModal";
import { employeeService } from "@/services/employee.service";
import { payrollService } from "@/services/payroll.service";
import { useAuthStore } from "@/store/auth.store";
import type { EmployeePublic, PayrollRecord, PayrollStatus } from "@/types";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];
const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  processed: "bg-blue-50 text-blue-700",
  draft: "bg-gray-100 text-gray-600",
};

export default function PayrollPage() {
  const { query: pageSearchQuery } = usePageSearch();
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  // page-search employee resolver
  useEffect(() => {
    const q = pageSearchQuery.trim().toLowerCase();

    if (!q) return;

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
  }, [pageSearchQuery, employees, selectedEmployeeId]);

  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    employeeService.list(0, 100).then((list) => {
      setEmployees(list);
      if (list.length > 0) setSelectedEmployeeId(list[0].id);
    });
  }, []);

  const loadRecords = (employeeId: string) => {
    setLoading(true);
    setError(null);
    payrollService
      .listForEmployee(employeeId)
      .then(setRecords)
      .catch((err) => {
        if (err?.response?.status === 403) {
          setError("You don't have access to view payroll for this employee.");
        } else {
          setError("Could not load payroll records.");
        }
        setRecords([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedEmployeeId) loadRecords(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const handleStatusChange = async (recordId: string, status: PayrollStatus) => {
    try {
      await payrollService.updateStatus(recordId, status);
      loadRecords(selectedEmployeeId);
    } catch {
      setError("Could not update payroll status.");
    }
  };

  return (
    <>
      <Topbar title="Payroll" subtitle="Monthly payslips" />
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
          {isHR && selectedEmployeeId && (
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
              <Plus size={16} />
              Add Payroll Record
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading ? (
          <Loader label="Loading payroll..." />
        ) : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Month</th>
                  <th className="px-5 py-3 font-medium">Basic Pay</th>
                  <th className="px-5 py-3 font-medium">Allowances</th>
                  <th className="px-5 py-3 font-medium">Deductions</th>
                  <th className="px-5 py-3 font-medium">Net Pay</th>
                  <th className="px-5 py-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 font-medium text-brand-dark">
                      {new Date(r.month).toLocaleDateString(undefined, { year: "numeric", month: "long" })}
                    </td>
                    <td className="px-5 py-3 text-gray-600">₹{r.basic_pay.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-600">₹{r.allowances.toLocaleString()}</td>
                    <td className="px-5 py-3 text-gray-600">₹{r.deductions.toLocaleString()}</td>
                    <td className="px-5 py-3 font-medium text-brand-dark">₹{r.net_pay.toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      {isHR ? (
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r.id, e.target.value as PayrollStatus)}
                          className="rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-brand"
                        >
                          <option value="draft">Draft</option>
                          <option value="processed">Processed</option>
                          <option value="paid">Paid</option>
                        </select>
                      ) : (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status]}`}>
                          {r.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {records.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                      No payroll records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {showAddModal && selectedEmployeeId && (
        <AddPayrollModal
          employeeId={selectedEmployeeId}
          onClose={() => setShowAddModal(false)}
          onAdded={() => loadRecords(selectedEmployeeId)}
        />
      )}
    </>
  );
}
