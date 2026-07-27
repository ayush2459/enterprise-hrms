"use client";

import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CandidateConvertResult } from "@/types";

export function ConversionResultModal({
  result,
  onClose,
}: {
  result: CandidateConvertResult;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyPassword = () => {
    navigator.clipboard.writeText(result.temporary_password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">Candidate Converted</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <p className="text-sm text-gray-600">
            This candidate is now an employee and appears on the Onboarding checklist. Share these
            credentials securely — the password won&apos;t be shown again.
          </p>
          <div className="rounded-md bg-surface-muted p-3 text-sm">
            <div className="mb-1 text-gray-500">Official Email</div>
            <div className="mb-3 font-medium text-brand-dark">{result.official_email}</div>
            <div className="mb-1 text-gray-500">Temporary Password</div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-medium text-brand-dark">{result.temporary_password}</span>
              <button onClick={copyPassword} className="flex items-center gap-1 text-xs text-brand hover:underline">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <Button className="w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
