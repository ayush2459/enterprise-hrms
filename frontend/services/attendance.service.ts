import { api } from "@/lib/api";
import type { AttendanceRecord, AttendanceStatus, AttendanceSummary } from "@/types";

export const attendanceService = {
  async listForEmployee(employeeId: string) {
    const { data } = await api.get<AttendanceRecord[]>(`/attendance/employee/${employeeId}`);
    return data;
  },

  async getSummary(employeeId: string) {
    const { data } = await api.get<AttendanceSummary>(`/attendance/employee/${employeeId}/summary`);
    return data;
  },

  async mark(employeeId: string, date: string, status: AttendanceStatus) {
    const { data } = await api.post<AttendanceRecord>(`/attendance/employee/${employeeId}`, {
      date,
      status,
    });
    return data;
  },
};
