"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { policyService } from "@/services/policy.service";
import type { PolicyAcknowledgementStatus } from "@/types";
import { Loader } from "@/components/common/Loader";

interface ComplianceModalProps {
  policyId: string;
  policyTitle: string;
  onClose: () => void;
}

export function ComplianceModal({ policyId, policyTitle, onClose }: ComplianceModalProps) {
  const [rows, setRows] = useState<PolicyAcknowledgementStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    policyService
      .getCompliance(policyId)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [policyId]);

  const acknowledgedCount = rows.filter((r) => r.acknowledged).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-brand-dark">{policyTitle}</h2>
            <p className="text-xs text-gray-500">
              {acknowledgedCount} of {rows.length} employees acknowledged
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto px-6 py-4">
          {loading ? (
            <Loader label="Loading compliance status..." />
          ) : (
            <ul className="divide-y divide-gray-100">
              {rows.map((row) => (
                <li key={row.user_id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-brand-dark">{row.full_name}</span>
                  <span
                    className={row.acknowledged ? "text-green-600" : "text-amber-600"}
                  >
                    {row.acknowledged ? "Acknowledged" : "Pending"}
                  </span>
                </li>
              ))}
              {rows.length === 0 && (
                <li className="py-6 text-center text-gray-400">No employees found.</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
