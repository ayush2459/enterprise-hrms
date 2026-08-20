"use client";

import { useEffect, useState } from "react";
import { Upload, Download, Check, X as XIcon } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { usePageSearch } from "@/components/layout/PageSearchContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { UploadDocumentModal } from "@/components/documents/UploadDocumentModal";
import { employeeService } from "@/services/employee.service";
import { documentService } from "@/services/document.service";
import { useAuthStore } from "@/store/auth.store";
import type { DocumentRecord, DocumentStatus, EmployeePublic } from "@/types";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

const STATUS_STYLES: Record<string, string> = {
  verified: "bg-green-50 text-green-700",
  submitted: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
  expired: "bg-gray-100 text-gray-600",
  pending_upload: "bg-gray-100 text-gray-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

export default function DocumentsPage() {
  const { query: pageSearchQuery } = usePageSearch();
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  // page-search employee resolver
  useEffect(() => {
    const q = pageSearchQuery.trim().toLowerCase();

    if (!q) return;

    const match = employees.find((employee) => {
      const haystack = [
        employee.full_name,
        employee.department,
        employee.designation,
        employee.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    if (match && match.id !== selectedEmployeeId) {
      setSelectedEmployeeId(match.id);
    }
  }, [pageSearchQuery, employees, selectedEmployeeId]);

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    employeeService.list(0, 100).then((list) => {
      setEmployees(list);
      if (list.length > 0) setSelectedEmployeeId(list[0].id);
    });
  }, []);

  const loadDocuments = (employeeId: string) => {
    setLoading(true);
    setError(null);
    documentService
      .listForEmployee(employeeId)
      .then(setDocuments)
      .catch(() => setError("Could not load documents for this employee."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedEmployeeId) loadDocuments(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const handleVerify = async (documentId: string, status: DocumentStatus) => {
    try {
      await documentService.verify(documentId, status);
      loadDocuments(selectedEmployeeId);
    } catch {
      setError("Could not update document status.");
    }
  };

  const handleDownload = async (doc: DocumentRecord) => {
    try {
      await documentService.download(doc.id, doc.file_name);
    } catch {
      setError("Could not download this document.");
    }
  };

  return (
    <>
      <Topbar title="Documents" subtitle="Employee document uploads & verification" />
      <div className="p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
          {selectedEmployeeId && (
            <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
              <Upload size={16} />
              Upload Document
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading ? (
          <Loader label="Loading documents..." />
        ) : selectedEmployeeId ? (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-brand-dark">Documents</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">File</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Uploaded</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-5 py-3 font-medium text-brand-dark">{doc.document_type}</td>
                    <td className="px-5 py-3 text-gray-600">{doc.file_name}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-gray-400 hover:text-brand"
                          title="Download"
                        >
                          <Download size={16} />
                        </button>
                        {isHR && doc.status === "submitted" && (
                          <>
                            <button
                              onClick={() => handleVerify(doc.id, "verified")}
                              className="text-gray-400 hover:text-green-600"
                              title="Verify"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleVerify(doc.id, "rejected")}
                              className="text-gray-400 hover:text-red-600"
                              title="Reject"
                            >
                              <XIcon size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {documents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                      No documents uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card className="py-16 text-center text-gray-400">
            No employees yet — add one from the Employees page first.
          </Card>
        )}
      </div>

      {showUploadModal && selectedEmployeeId && (
        <UploadDocumentModal
          employeeId={selectedEmployeeId}
          onClose={() => setShowUploadModal(false)}
          onUploaded={() => loadDocuments(selectedEmployeeId)}
        />
      )}
    </>
  );
}
