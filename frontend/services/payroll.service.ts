import { api } from "@/lib/api";
import type { PayrollRecord, PayrollStatus } from "@/types";

export const payrollService = {
  async listForEmployee(employeeId: string) {
    const { data } = await api.get<PayrollRecord[]>(`/payroll/employee/${employeeId}`);
    return data;
  },

  async createRecord(employeeId: string, month: string, basicPay: number, allowances: number, deductions: number) {
    const { data } = await api.post<PayrollRecord>(`/payroll/employee/${employeeId}`, {
      month,
      basic_pay: basicPay,
      allowances,
      deductions,
    });
    return data;
  },

  async updateStatus(recordId: string, status: PayrollStatus) {
    const { data } = await api.patch<PayrollRecord>(`/payroll/${recordId}/status`, { status });
    return data;
  },
};
