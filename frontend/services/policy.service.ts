import { api } from "@/lib/api";
import type { PolicyAcknowledgementStatus, PolicyRecord, PolicyWithAck } from "@/types";

export const policyService = {
  async list() {
    const { data } = await api.get<PolicyWithAck[]>("/policies");
    return data;
  },

  async publish(title: string, category: string, file: File) {
    const form = new FormData();
    form.append("title", title);
    form.append("category", category);
    form.append("file", file);
    const { data } = await api.post<PolicyRecord>("/policies", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async acknowledge(policyId: string) {
    await api.post(`/policies/${policyId}/acknowledge`);
  },

  async download(policyId: string, fileName: string) {
    const response = await api.get(`/policies/${policyId}/download`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async getCompliance(policyId: string) {
    const { data } = await api.get<PolicyAcknowledgementStatus[]>(`/policies/${policyId}/compliance`);
    return data;
  },
};
