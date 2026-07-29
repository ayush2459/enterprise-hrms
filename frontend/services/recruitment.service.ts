import { api } from "@/lib/api";
import type {
  Candidate,
  CandidateConvertResult,
  CandidateStage,
  JobOpening,
  JobOpeningStatus,
} from "@/types";

export const recruitmentService = {
  async listOpenings() {
    const { data } = await api.get<JobOpening[]>("/recruitment/openings");
    return data;
  },

  async createOpening(title: string, department: string, positionsCount: number) {
    const { data } = await api.post<JobOpening>("/recruitment/openings", {
      title,
      department,
      positions_count: positionsCount,
    });
    return data;
  },

  async updateOpeningStatus(openingId: string, newStatus: JobOpeningStatus) {
    const { data } = await api.patch<JobOpening>(`/recruitment/openings/${openingId}/status`, {
      status: newStatus,
    });
    return data;
  },

  async listCandidates(openingId: string) {
    const { data } = await api.get<Candidate[]>(`/recruitment/openings/${openingId}/candidates`);
    return data;
  },

  async addCandidate(
    openingId: string,
    fullName: string,
    email: string,
    phone: string,
    noticePeriodDays: number | null,
    resume: File | null
  ) {
    const form = new FormData();
    form.append("full_name", fullName);
    form.append("email", email);
    if (phone) form.append("phone", phone);
    if (noticePeriodDays !== null) form.append("notice_period_days", String(noticePeriodDays));
    if (resume) form.append("resume", resume);
    const { data } = await api.post<Candidate>(
      `/recruitment/openings/${openingId}/candidates`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async updateStage(candidateId: string, stage: CandidateStage) {
    const { data } = await api.patch<Candidate>(`/recruitment/candidates/${candidateId}/stage`, {
      stage,
    });
    return data;
  },

  async convert(candidateId: string) {
    const { data } = await api.post<CandidateConvertResult>(
      `/recruitment/candidates/${candidateId}/convert`
    );
    return data;
  },

  async downloadResume(candidateId: string, fileName: string) {
    const response = await api.get(`/recruitment/candidates/${candidateId}/resume`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
