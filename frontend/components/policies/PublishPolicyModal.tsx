"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { policyService } from "@/services/policy.service";

interface PublishPolicyModalProps {
  onClose: () => void;
  onPublished: () => void;
}

export function PublishPolicyModal({ onClose, onPublished }: PublishPolicyModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose a file.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await policyService.publish(title, category, file);
      onPublished();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not publish policy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">Publish Policy</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Input
            id="title"
            label="Policy Title"
            placeholder="e.g. Leave Policy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <p className="text-xs text-gray-400 -mt-2">
            Uploading with an existing title publishes a new version and supersedes the old one.
          </p>
          <Input
            id="category"
            label="Category"
            placeholder="e.g. Leave, Conduct, WFH"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-dark">File</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-dark"
              required
            />
            <span className="text-xs text-gray-400">PDF, JPG, or PNG. Max 10 MB.</span>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Publishing..." : "Publish"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
