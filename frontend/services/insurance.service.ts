import { api } from "@/lib/api";
import type { Dependent, InsuranceFull, InsurancePolicy, InsurancePolicyInput } from "@/types";

export const insuranceService = {
  async getForEmployee(employeeId: string) {
    const { data } = await api.get<InsuranceFull>(`/insurance/employee/${employeeId}`);
    return data;
  },

  async upsertPolicy(employeeId: string, payload: InsurancePolicyInput) {
    const { data } = await api.put<InsurancePolicy>(`/insurance/employee/${employeeId}/policy`, payload);
    return data;
  },

  async addDependent(
    employeeId: string,
    fullName: string,
    relationship: string,
    dateOfBirth: string
  ) {
    const { data } = await api.post<Dependent>(`/insurance/employee/${employeeId}/dependents`, {
      full_name: fullName,
      relationship,
      date_of_birth: dateOfBirth,
    });
    return data;
  },

  async verifyDependent(dependentId: string) {
    const { data } = await api.patch<Dependent>(`/insurance/dependents/${dependentId}/verify`);
    return data;
  },
};
