import { api } from "@/lib/api";
import type { BGVCheck, BGVCheckStatus, BGVCheckType } from "@/types";

export const bgvService = {
  async listForEmployee(employeeId: string) {
    const { data } = await api.get<BGVCheck[]>(`/bgv/employee/${employeeId}`);
    return data;
  },

  async initiate(employeeId: string, checkType: BGVCheckType) {
    const { data } = await api.post<BGVCheck>(`/bgv/employee/${employeeId}`, {
      check_type: checkType,
    });
    return data;
  },

  async updateStatus(checkId: string, status: BGVCheckStatus, notes?: string) {
    const { data } = await api.patch<BGVCheck>(`/bgv/checks/${checkId}`, { status, notes });
    return data;
  },
};
