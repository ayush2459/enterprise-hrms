"use client";

import { useEffect, useState } from "react";
import { Upload, Download, CheckCircle, Users } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { PublishPolicyModal } from "@/components/policies/PublishPolicyModal";
import { ComplianceModal } from "@/components/policies/ComplianceModal";
import { policyService } from "@/services/policy.service";
import { useAuthStore } from "@/store/auth.store";
import type { PolicyWithAck } from "@/types";
import { usePageSearch } from "@/components/layout/PageSearchContext";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PoliciesPage() {
  const { query: pageSearchQuery } = usePageSearch();
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [policies, setPolicies] = useState<PolicyWithAck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [complianceFor, setComplianceFor] = useState<PolicyWithAck | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadPolicies = () => {
    setLoading(true);
    policyService
      .list()
      .then(setPolicies)
      .catch(() => setError("Could not load policies."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  const handleAcknowledge = async (policyId: string) => {
    try {
      await policyService.acknowledge(policyId);
      loadPolicies();
    } catch {
      setError("Could not record acknowledgement.");
    }
  };

  const handleDownload = async (policy: PolicyWithAck) => {
    try {
      await policyService.download(policy.id, policy.file_name);
    } catch {
      setError("Could not download this policy.");
    }
  };

  const filteredPolicies = policies.filter((p) => {
    const q = pageSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return [p.title, p.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const groupedByCategory = filteredPolicies.reduce<Record<string, PolicyWithAck[]>>((acc, p) => {
    (acc[p.category] ??= []).push(p);
    return acc;
  }, {});

  return (
    <>
      <Topbar title="Policies" subtitle="Company policies library" />
      <div className="p-8 space-y-6">
        <div className="flex justify-end">
          {isHR && (
            <Button onClick={() => setShowPublishModal(true)} className="flex items-center gap-2">
              <Upload size={16} />
              Publish Policy
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading ? (
          <Loader label="Loading policies..." />
        ) : policies.length === 0 ? (
          <Card className="py-16 text-center text-gray-400">
            No policies published yet.
          </Card>
        ) : (
          Object.entries(groupedByCategory).map(([category, items]) => (
            <Card key={category} className="p-0 overflow-hidden">
              <div className="border-b border-gray-100 px-5 py-3">
                <h2 className="text-sm font-semibold text-brand-dark">{category}</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-surface-muted text-left text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Policy</th>
                    <th className="px-5 py-3 font-medium">Version</th>
                    <th className="px-5 py-3 font-medium">Size</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((policy) => (
                    <tr key={policy.id}>
                      <td className="px-5 py-3 font-medium text-brand-dark">{policy.title}</td>
                      <td className="px-5 py-3 text-gray-600">v{policy.version}</td>
                      <td className="px-5 py-3 text-gray-600">{formatSize(policy.file_size_bytes)}</td>
                      <td className="px-5 py-3">
                        {policy.acknowledged ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                            <CheckCircle size={14} />
                            Acknowledged
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-amber-600">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleDownload(policy)}
                            className="text-gray-400 hover:text-brand"
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          {isHR && (
                            <button
                              onClick={() => setComplianceFor(policy)}
                              className="text-gray-400 hover:text-brand"
                              title="View compliance"
                            >
                              <Users size={16} />
                            </button>
                          )}
                          {!policy.acknowledged && (
                            <Button onClick={() => handleAcknowledge(policy.id)} className="text-xs px-2 py-1">
                              Acknowledge
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))
        )}
      </div>

      {showPublishModal && (
        <PublishPolicyModal onClose={() => setShowPublishModal(false)} onPublished={loadPolicies} />
      )}
      {complianceFor && (
        <ComplianceModal
          policyId={complianceFor.id}
          policyTitle={complianceFor.title}
          onClose={() => setComplianceFor(null)}
        />
      )}
    </>
  );
}
