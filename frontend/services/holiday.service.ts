import { api } from "@/lib/api";
import type { Holiday } from "@/types";

export const holidayService = {
  async listForYear(year?: number) {
    const { data } = await api.get<Holiday[]>("/holidays", { params: { year } });
    return data;
  },

  async create(payload: { name: string; date: string; is_optional?: boolean }) {
    const { data } = await api.post<Holiday>("/holidays", payload);
    return data;
  },

  async update(
    holidayId: string,
    payload: { name: string; date: string; is_optional?: boolean }
  ) {
    const { data } = await api.patch<Holiday>(
      `/holidays/${holidayId}`,
      payload
    );
    return data;
  },

  async delete(holidayId: string) {
    await api.delete(`/holidays/${holidayId}`);
  },
};
