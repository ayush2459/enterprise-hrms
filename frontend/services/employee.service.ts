import { api } from "@/lib/api";
import type {
  EmployeeCreateInput,
  EmployeeCreateResult,
  EmployeeFull,
  EmployeeImportResult,
  EmployeePublic,
  EmployeeStats,
} from "@/types";

// No trailing slash on the collection routes ("/employees", not
// "/employees/") — the Next.js rewrite's :path* catch-all strips a
// trailing slash when building the proxied backend URL, so calling with
// one caused a 307 redirect that silently dropped POST bodies. Backend
// routes were changed to match (see employees.py).
export const employeeService = {
  async list(skip = 0, limit = 50, includeOffboarded = false) {
    const { data } = await api.get<EmployeePublic[]>("/employees", {
      params: { skip, limit, include_offboarded: includeOffboarded },
    });
    return data;
  },

  async listOffboarded(limit = 50) {
    const { data } = await api.get<EmployeePublic[]>("/employees/offboarded", {
      params: { limit },
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

  async offboard(id: string, reason: "resigned" | "terminated") {
    const { data } = await api.post<EmployeeFull | EmployeePublic>(
      `/employees/${id}/offboard`,
      { reason }
    );
    return data;
  },


  async reactivate(id: string) {
    const { data } = await api.post<EmployeePublic>(
      `/employees/${id}/reactivate`,
    );
    return data;
  }


  async importFromExcel(file: File) {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<EmployeeImportResult>("/employees/import", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
