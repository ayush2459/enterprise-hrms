import { api } from "@/lib/api";
import type { EmployeeProject } from "@/types";

export const projectService = {
  async listForEmployee(employeeId: string) {
    const { data } = await api.get<EmployeeProject[]>(
      `/projects/employee/${employeeId}`
    );
    return data;
  },

  async create(payload: Omit<EmployeeProject, "id">) {
    const { data } = await api.post<EmployeeProject>(
      "/projects",
      payload
    );
    return data;
  },

  async update(
    projectId: string,
    payload: Omit<EmployeeProject, "id" | "employee_id">
  ) {
    const { data } = await api.patch<EmployeeProject>(
      `/projects/${projectId}`,
      payload
    );
    return data;
  },

  async delete(projectId: string) {
    await api.delete(`/projects/${projectId}`);
  },
};
