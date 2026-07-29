"use client";

import { useEffect, useState } from "react";
import { Plus, Download, ArrowRightCircle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { CreateOpeningModal } from "@/components/recruitment/CreateOpeningModal";
import { AddCandidateModal } from "@/components/recruitment/AddCandidateModal";
import { ConversionResultModal } from "@/components/recruitment/ConversionResultModal";
import { recruitmentService } from "@/services/recruitment.service";
import type { Candidate, CandidateConvertResult, CandidateStage, JobOpening, JobOpeningStatus } from "@/types";

const STAGE_STYLES: Record<string, string> = {
  applied: "bg-gray-100 text-gray-600",
  shortlisted: "bg-blue-50 text-blue-700",
  interview: "bg-amber-50 text-amber-700",
  offer_extended: "bg-purple-50 text-purple-700",
  hired: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const STAGE_OPTIONS: CandidateStage[] = ["applied", "shortlisted", "interview", "offer_extended", "rejected"];

export default function RecruitmentPage() {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [selectedOpeningId, setSelectedOpeningId] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateOpening, setShowCreateOpening] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [conversionResult, setConversionResult] = useState<CandidateConvertResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadOpenings = () => {
    recruitmentService.listOpenings().then((list) => {
      setOpenings(list);
      if (list.length > 0 && !selectedOpeningId) setSelectedOpeningId(list[0].id);
    });
  };

  useEffect(() => {
    loadOpenings();
  }, []);

  const loadCandidates = (openingId: string) => {
    setLoading(true);
    recruitmentService
      .listCandidates(openingId)
      .then(setCandidates)
      .catch(() => setError("Could not load candidates."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedOpeningId) loadCandidates(selectedOpeningId);
  }, [selectedOpeningId]);

  const handleOpeningStatusChange = async (openingId: string, status: JobOpeningStatus) => {
    try {
      await recruitmentService.updateOpeningStatus(openingId, status);
      loadOpenings();
    } catch {
      setError("Could not update opening status.");
    }
  };

  const handleStageChange = async (candidateId: string, stage: CandidateStage) => {
    try {
      await recruitmentService.updateStage(candidateId, stage);
      loadCandidates(selectedOpeningId);
    } catch {
      setError("Could not update candidate stage.");
    }
  };

  const handleConvert = async (candidateId: string) => {
    try {
      const result = await recruitmentService.convert(candidateId);
      setConversionResult(result);
      loadCandidates(selectedOpeningId);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not convert candidate.");
    }
  };

  const handleDownloadResume = async (candidate: Candidate) => {
    if (!candidate.resume_file_name) return;
    try {
      await recruitmentService.downloadResume(candidate.id, candidate.resume_file_name);
    } catch {
      setError("Could not download resume.");
    }
  };

  return (
    <>
      <Topbar title="Recruitment" subtitle="Job openings & candidate pipeline" />
      <div className="p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Job Opening</label>
            <select
              value={selectedOpeningId}
              onChange={(e) => setSelectedOpeningId(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {openings.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title} ({o.department})
                </option>
              ))}
            </select>
            {selectedOpeningId && (
              <select
                value={openings.find((o) => o.id === selectedOpeningId)?.status ?? "open"}
                onChange={(e) =>
                  handleOpeningStatusChange(selectedOpeningId, e.target.value as JobOpeningStatus)
                }
                className="rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-brand"
              >
                <option value="open">Open</option>
                <option value="on_hold">On Hold</option>
                <option value="closed">Closed</option>
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowCreateOpening(true)} className="flex items-center gap-2">
              <Plus size={16} />
              New Opening
            </Button>
            {selectedOpeningId && (
              <Button onClick={() => setShowAddCandidate(true)} className="flex items-center gap-2">
                <Plus size={16} />
                Add Candidate
              </Button>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {openings.length === 0 ? (
          <Card className="py-16 text-center text-gray-400">
            No job openings yet. Click &quot;New Opening&quot; to create one.
          </Card>
        ) : loading ? (
          <Loader label="Loading candidates..." />
        ) : (
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Candidate</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Notice Period</th>
                  <th className="px-5 py-3 font-medium">Stage</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {candidates.map((c) => (
                  <tr key={c.id}>
                    <td className="px-5 py-3 font-medium text-brand-dark">{c.full_name}</td>
                    <td className="px-5 py-3 text-gray-600">{c.email}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {c.notice_period_days != null ? `${c.notice_period_days} days` : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STAGE_STYLES[c.stage]}`}>
                        {c.stage.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {c.resume_file_name && (
                          <button
                            onClick={() => handleDownloadResume(c)}
                            className="text-gray-400 hover:text-brand"
                            title="Download resume"
                          >
                            <Download size={16} />
                          </button>
                        )}
                        {c.stage !== "hired" && c.stage !== "rejected" && (
                          <select
                            value={c.stage}
                            onChange={(e) => handleStageChange(c.id, e.target.value as CandidateStage)}
                            className="rounded-md border border-gray-200 px-2 py-1 text-xs outline-none focus:border-brand"
                          >
                            {STAGE_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        )}
                        {c.stage === "offer_extended" && (
                          <button
                            onClick={() => handleConvert(c.id)}
                            className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                            title="Convert to employee"
                          >
                            <ArrowRightCircle size={14} />
                            Convert
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {candidates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                      No candidates for this opening yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {showCreateOpening && (
        <CreateOpeningModal onClose={() => setShowCreateOpening(false)} onCreated={loadOpenings} />
      )}
      {showAddCandidate && selectedOpeningId && (
        <AddCandidateModal
          openingId={selectedOpeningId}
          onClose={() => setShowAddCandidate(false)}
          onAdded={() => loadCandidates(selectedOpeningId)}
        />
      )}
      {conversionResult && (
        <ConversionResultModal result={conversionResult} onClose={() => setConversionResult(null)} />
      )}
    </>
  );
}
