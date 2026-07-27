import { api } from "@/lib/api";
import type { PerformanceReview, ReviewCycle, ReviewCycleStatus, ReviewRating } from "@/types";

export const performanceService = {
  async listCycles() {
    const { data } = await api.get<ReviewCycle[]>("/performance/cycles");
    return data;
  },

  async createCycle(name: string, startDate: string, endDate: string) {
    const { data } = await api.post<ReviewCycle>("/performance/cycles", {
      name,
      start_date: startDate,
      end_date: endDate,
    });
    return data;
  },

  async updateCycleStatus(cycleId: string, status: ReviewCycleStatus) {
    const { data } = await api.patch<ReviewCycle>(`/performance/cycles/${cycleId}/status`, { status });
    return data;
  },

  async listForEmployee(employeeId: string) {
    const { data } = await api.get<PerformanceReview[]>(`/performance/employee/${employeeId}`);
    return data;
  },

  async initiateReview(cycleId: string, employeeId: string) {
    const { data } = await api.post<PerformanceReview>(
      `/performance/cycles/${cycleId}/employee/${employeeId}`
    );
    return data;
  },

  async submitSelfAssessment(reviewId: string, selfAssessment: string) {
    const { data } = await api.patch<PerformanceReview>(
      `/performance/reviews/${reviewId}/self-assessment`,
      { self_assessment: selfAssessment }
    );
    return data;
  },

  async submitManagerAssessment(reviewId: string, managerAssessment: string, rating: ReviewRating) {
    const { data } = await api.patch<PerformanceReview>(
      `/performance/reviews/${reviewId}/manager-assessment`,
      { manager_assessment: managerAssessment, rating }
    );
    return data;
  },
};
