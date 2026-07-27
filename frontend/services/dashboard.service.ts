import { api } from "@/lib/api";
import type { DashboardSummary } from "@/types";

export const dashboardService = {
  async getSummary() {
    const { data } = await api.get<DashboardSummary>("/dashboard/summary");
    return data;
  },
};
