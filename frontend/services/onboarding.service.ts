import { api } from "@/lib/api";
import type { OnboardingStatus } from "@/types";

export const onboardingService = {
  async list() {
    const { data } = await api.get<OnboardingStatus[]>("/onboarding");
    return data;
  },

  async markComplete(employeeId: string) {
    await api.post(`/onboarding/${employeeId}/complete`);
  },
};
