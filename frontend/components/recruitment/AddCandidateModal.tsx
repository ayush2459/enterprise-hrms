"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { recruitmentService } from "@/services/recruitment.service";

export function AddCandidateModal({
  openingId,
  onClose,
  onAdded,
}: {
  openingId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [noticePeriodDays, setNoticePeriodDays] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await recruitmentService.addCandidate(
        openingId,
        fullName,
        email,
        phone,
        noticePeriodDays === "" ? null : Number(noticePeriodDays),
        resume
      );
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not add candidate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">Add Candidate</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Input id="full_name" label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="phone" label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input
            id="notice_period_days"
            label="Notice Period at Current Job (days, optional)"
            type="number"
            min="0"
            value={noticePeriodDays}
            onChange={(e) => setNoticePeriodDays(e.target.value)}
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-dark">Resume (optional)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setResume(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-dark"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Adding..." : "Add Candidate"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
