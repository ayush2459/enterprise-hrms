import { api } from "@/lib/api";
import type { LeaveBalance, LeaveRequest, LeaveRequestStatus, LeaveType } from "@/types";

export const leaveService = {
  async listTypes() {
    const { data } = await api.get<LeaveType[]>("/leaves/types");
    return data;
  },

  async createType(name: string, annualQuotaDays: number) {
    const { data } = await api.post<LeaveType>("/leaves/types", {
      name,
      annual_quota_days: annualQuotaDays,
    });
    return data;
  },

  async listForEmployee(employeeId: string) {
    const { data } = await api.get<LeaveRequest[]>(`/leaves/employee/${employeeId}`);
    return data;
  },

  async getBalance(employeeId: string) {
    const { data } = await api.get<LeaveBalance[]>(`/leaves/employee/${employeeId}/balance`);
    return data;
  },

  async apply(employeeId: string, leaveTypeId: string, startDate: string, endDate: string, reason: string) {
    const { data } = await api.post<LeaveRequest>(`/leaves/employee/${employeeId}`, {
      leave_type_id: leaveTypeId,
      start_date: startDate,
      end_date: endDate,
      reason,
    });
    return data;
  },

  async decide(requestId: string, status: LeaveRequestStatus) {
    const { data } = await api.patch<LeaveRequest>(`/leaves/${requestId}/decision`, { status });
    return data;
  },
};
