import { api } from "@/lib/api";
import type { DocumentRecord, DocumentStatus } from "@/types";

export const HR_DOCUMENT_TYPES = [
  { value: "pan_card", label: "PAN Card" },
  { value: "aadhaar_card", label: "Aadhaar Card" },
  { value: "resume", label: "Resume / CV" },
  { value: "passport", label: "Passport" },
  { value: "photograph", label: "Photograph" },
  { value: "address_proof", label: "Address Proof" },
  { value: "bank_proof", label: "Bank Proof / Cancelled Cheque" },
  { value: "educational_certificate", label: "Educational Certificate" },
  { value: "class_10_certificate", label: "10th Certificate" },
  { value: "class_12_certificate", label: "12th Certificate" },
  { value: "graduation_certificate", label: "Graduation Certificate" },
  { value: "employment_proof", label: "Employment Proof" },
  { value: "joining_letter", label: "Joining Letter" },
  { value: "offer_letter", label: "Offer Letter" },
  { value: "appraisal_letter", label: "Appraisal Letter" },
  { value: "relieving_letter", label: "Relieving Letter" },
  { value: "experience_letter", label: "Experience Letter" },
  { value: "other", label: "Other Document" },
] as const;

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
