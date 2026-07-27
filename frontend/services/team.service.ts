import { api } from "@/lib/api";
import type { OrgSnippet, TeamStatusRow } from "@/types";

export const teamService = {
  async getOrgSnippet(employeeId: string) {
    const { data } = await api.get<OrgSnippet>(`/teams/${employeeId}/org`);
    return data;
  },

  async getStatusSummary(employeeId: string) {
    const { data } = await api.get<TeamStatusRow[]>(`/teams/${employeeId}/status-summary`);
    return data;
  },
};
