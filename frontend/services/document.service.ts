import { api } from "@/lib/api";
import type { DocumentRecord, DocumentStatus } from "@/types";

export const documentService = {
  async listForEmployee(employeeId: string) {
    const { data } = await api.get<DocumentRecord[]>(`/documents/employee/${employeeId}`);
    return data;
  },

  async upload(employeeId: string, documentType: string, file: File) {
    const form = new FormData();
    form.append("document_type", documentType);
    form.append("file", file);
    const { data } = await api.post<DocumentRecord>(
      `/documents/employee/${employeeId}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async verify(documentId: string, status: DocumentStatus, notes?: string) {
    const { data } = await api.patch<DocumentRecord>(`/documents/${documentId}/verify`, {
      status,
      notes,
    });
    return data;
  },

  async download(documentId: string, fileName: string) {
    const response = await api.get(`/documents/${documentId}/download`, {
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
