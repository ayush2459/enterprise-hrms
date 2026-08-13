import { api } from "@/lib/api";
import type { Asset } from "@/types";

export const assetService = {
  async listForEmployee(employeeId: string) {
    const { data } = await api.get<Asset[]>(`/assets/employee/${employeeId}`);
    return data;
  },

  async assign(payload: {
    employee_id: string;
    asset_type: string;
    asset_name: string;
    serial_number?: string;
    assigned_date?: string;
    notes?: string;
  }) {
    const { data } = await api.post<Asset>("/assets", payload);
    return data;
  },

  async markReturned(assetId: string, returnedDate?: string) {
    const { data } = await api.post<Asset>(`/assets/${assetId}/return`, {
      returned_date: returnedDate ?? null,
    });
    return data;
  },
};
