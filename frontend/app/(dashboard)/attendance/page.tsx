"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { usePageSearch } from "@/components/layout/PageSearchContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/common/Loader";
import { employeeService } from "@/services/employee.service";
import { attendanceService } from "@/services/attendance.service";
import { useAuthStore } from "@/store/auth.store";
import type { AttendanceRecord, AttendanceStatus, AttendanceSummary, EmployeePublic } from "@/types";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];
const STATUS_STYLES: Record<string, string> = {
  present: "bg-green-50 text-green-700",
  absent: "bg-red-50 text-red-700",
  half_day: "bg-amber-50 text-amber-700",
  on_leave: "bg-blue-50 text-blue-700",
  holiday: "bg-purple-50 text-purple-700",
};

export default function AttendancePage() {
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

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markDate, setMarkDate] = useState("");
  const [markStatus, setMarkStatus] = useState<AttendanceStatus>("present");

  useEffect(() => {
    employeeService.list(0, 100).then((list) => {
      setEmployees(list);
      if (list.length > 0) setSelectedEmployeeId(list[0].id);
    });
  }, []);

  const load = (employeeId: string) => {
    setLoading(true);
    setError(null);
    Promise.all([attendanceService.listForEmployee(employeeId), attendanceService.getSummary(employeeId)])
      .then(([recs, summ]) => {
        setRecords(recs);
        setSummary(summ);
      })
      .catch(() => setError("Could not load attendance."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedEmployeeId) load(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const handleMark = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await attendanceService.mark(selectedEmployeeId, markDate, markStatus);
      load(selectedEmployeeId);
    } catch {
      setError("Could not mark attendance.");
    }
  };

  return (
    <>
      <Topbar title="Attendance" subtitle="Daily attendance tracking" />
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
          <Loader label="Loading attendance..." />
        ) : (
          <>
            {summary && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <Card className="text-center">
                  <p className="text-2xl font-semibold text-brand-dark">{summary.present}</p>
                  <p className="text-xs text-gray-500">Present</p>
                </Card>
                <Card className="text-center">
                  <p className="text-2xl font-semibold text-brand-dark">{summary.absent}</p>
                  <p className="text-xs text-gray-500">Absent</p>
                </Card>
                <Card className="text-center">
                  <p className="text-2xl font-semibold text-brand-dark">{summary.half_day}</p>
                  <p className="text-xs text-gray-500">Half Day</p>
                </Card>
                <Card className="text-center">
                  <p className="text-2xl font-semibold text-brand-dark">{summary.on_leave}</p>
                  <p className="text-xs text-gray-500">On Leave</p>
                </Card>
                <Card className="text-center">
                  <p className="text-2xl font-semibold text-brand-dark">{summary.holiday}</p>
                  <p className="text-xs text-gray-500">Holiday</p>
                </Card>
              </div>
            )}

            {isHR && (
              <Card>
                <h2 className="mb-3 text-sm font-semibold text-brand-dark">Mark Attendance</h2>
                <form onSubmit={handleMark} className="flex flex-wrap items-end gap-3">
                  <Input
                    id="mark_date"
                    label="Date"
                    type="date"
                    value={markDate}
                    onChange={(e) => setMarkDate(e.target.value)}
                    required
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-brand-dark">Status</label>
                    <select
                      value={markStatus}
                      onChange={(e) => setMarkStatus(e.target.value as AttendanceStatus)}
                      className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="half_day">Half Day</option>
                      <option value="on_leave">On Leave</option>
                      <option value="holiday">Holiday</option>
                    </select>
                  </div>
                  <Button type="submit" className="flex items-center gap-2">
                    <Plus size={16} />
                    Mark
                  </Button>
                </form>
              </Card>
            )}

            <Card className="p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3 font-medium text-brand-dark">
                        {new Date(r.date).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[r.status]}`}>
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-5 py-8 text-center text-gray-400">
                        No attendance records yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
