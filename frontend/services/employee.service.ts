import { api } from "@/lib/api";
import type {
  EmployeeCreateInput,
  EmployeeCreateResult,
  EmployeeFull,
  EmployeePublic,
  EmployeeStats,
  OffboardInput,
  SeparatedEmployee,
} from "@/types";

// No trailing slash on the collection routes ("/employees", not
// "/employees/") — the Next.js rewrite's :path* catch-all strips a
// trailing slash when building the proxied backend URL, so calling with
// one caused a 307 redirect that silently dropped POST bodies. Backend
// routes were changed to match (see employees.py).
export const employeeService = {
  async list(skip = 0, limit = 50) {
    const { data } = await api.get<EmployeePublic[]>("/employees", {
      params: { skip, limit },
    });
    return data;
  },

  async listSeparated(skip = 0, limit = 50) {
    const { data } = await api.get<SeparatedEmployee[]>("/employees/separated", {
      params: { skip, limit },
    });
    return data;
  },

  async getStats() {
    const { data } = await api.get<EmployeeStats>("/employees/stats/summary");
    return data;
  },

  async create(payload: EmployeeCreateInput) {
    const { data } = await api.post<EmployeeCreateResult>("/employees", payload);
    return data;
  },

  async getById(id: string) {
    const { data } = await api.get<EmployeeFull | EmployeePublic>(`/employees/${id}`);
    return data;
  },

  async update(id: string, payload: Partial<EmployeeFull>) {
    const { data } = await api.patch<EmployeeFull>(`/employees/${id}`, payload);
    return data;
  },

  async requestConversion(id: string) {
    const { data } = await api.post<EmployeeFull | EmployeePublic>(
      `/employees/${id}/conversion/request`
    );
    return data;
  },

  async decideConversion(id: string, approve: boolean) {
    const { data } = await api.post<EmployeeFull | EmployeePublic>(
      `/employees/${id}/conversion/decide`,
      { approve }
    );
    return data;
  },

  async offboard(id: string, payload: OffboardInput) {
    const { data } = await api.post<EmployeeFull>(`/employees/${id}/offboard`, payload);
    return data;
  },

  async reactivate(id: string) {
    const { data } = await api.post<EmployeeFull>(`/employees/${id}/reactivate`);
    return data;
  },
};
