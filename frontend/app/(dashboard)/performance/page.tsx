"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { usePageSearch } from "@/components/layout/PageSearchContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { CreateCycleModal } from "@/components/performance/CreateCycleModal";
import { employeeService } from "@/services/employee.service";
import { performanceService } from "@/services/performance.service";
import { useAuthStore } from "@/store/auth.store";
import type { EmployeePublic, PerformanceReview, ReviewCycle, ReviewCycleStatus, ReviewRating } from "@/types";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];
const RATING_STYLES: Record<string, string> = {
  exceeds_expectations: "bg-green-50 text-green-700",
  meets_expectations: "bg-blue-50 text-blue-700",
  below_expectations: "bg-red-50 text-red-700",
  not_rated: "bg-gray-100 text-gray-600",
};

export default function PerformancePage() {
  const { query: pageSearchQuery } = usePageSearch();
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
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

  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateCycle, setShowCreateCycle] = useState(false);
  const [selfText, setSelfText] = useState("");
  const [managerText, setManagerText] = useState("");
  const [rating, setRating] = useState<ReviewRating>("meets_expectations");

  const loadCycles = () => {
    performanceService.listCycles().then((list) => {
      setCycles(list);
      if (list.length > 0 && !selectedCycleId) setSelectedCycleId(list[0].id);
    });
  };

  useEffect(() => {
    loadCycles();
    employeeService.list(0, 100).then((list) => {
      setEmployees(list);
      if (list.length > 0) setSelectedEmployeeId(list[0].id);
    });
  }, []);

  const loadReviews = (employeeId: string) => {
    setLoading(true);
    performanceService
      .listForEmployee(employeeId)
      .then(setReviews)
      .catch(() => setError("Could not load performance reviews."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedEmployeeId) loadReviews(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const currentReview = reviews.find((r) => r.review_cycle_id === selectedCycleId);

  useEffect(() => {
    setSelfText(currentReview?.self_assessment ?? "");
    setManagerText(currentReview?.manager_assessment ?? "");
    setRating(currentReview?.rating ?? "meets_expectations");
  }, [currentReview?.id]);

  const handleInitiate = async () => {
    try {
      await performanceService.initiateReview(selectedCycleId, selectedEmployeeId);
      loadReviews(selectedEmployeeId);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not initiate review.");
    }
  };

  const handleSubmitSelf = async () => {
    if (!currentReview) return;
    try {
      await performanceService.submitSelfAssessment(currentReview.id, selfText);
      loadReviews(selectedEmployeeId);
    } catch {
      setError("Could not submit self-assessment.");
    }
  };

  const handleSubmitManager = async () => {
    if (!currentReview) return;
    try {
      await performanceService.submitManagerAssessment(currentReview.id, managerText, rating);
      loadReviews(selectedEmployeeId);
    } catch {
      setError("Could not submit manager assessment.");
    }
  };

  const isSelf = !!user && !!employees.find((e) => e.id === selectedEmployeeId);

  return (
    <>
      <Topbar title="Performance" subtitle="Review cycles & assessments" />
      <div className="p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Cycle</label>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
            <label className="ml-4 text-sm text-gray-500">Employee</label>
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
          {isHR && (
            <Button variant="secondary" onClick={() => setShowCreateCycle(true)} className="flex items-center gap-2">
              <Plus size={16} />
              New Cycle
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading ? (
          <Loader label="Loading review..." />
        ) : cycles.length === 0 ? (
          <Card className="py-16 text-center text-gray-400">No review cycles yet.</Card>
        ) : !currentReview ? (
          <Card className="py-16 text-center text-gray-400">
            <p className="mb-4">No review started for this employee in this cycle.</p>
            {isHR && <Button onClick={handleInitiate}>Initiate Review</Button>}
          </Card>
        ) : (
          <>
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-brand-dark">Self-Assessment</h2>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs capitalize text-gray-600">
                  {currentReview.status.replace(/_/g, " ")}
                </span>
              </div>
              <textarea
                value={selfText}
                onChange={(e) => setSelfText(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="What went well this cycle? What could improve?"
              />
              <Button onClick={handleSubmitSelf} className="mt-3 text-xs px-3 py-1.5">
                Submit Self-Assessment
              </Button>
            </Card>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-brand-dark">Manager Assessment</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${RATING_STYLES[currentReview.rating]}`}>
                  {currentReview.rating.replace(/_/g, " ")}
                </span>
              </div>
              <textarea
                value={managerText}
                onChange={(e) => setManagerText(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-gray-200 p-3 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                placeholder="Manager feedback..."
              />
              <div className="mt-3 flex items-center gap-3">
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value as ReviewRating)}
                  className="rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-brand"
                >
                  <option value="below_expectations">Below Expectations</option>
                  <option value="meets_expectations">Meets Expectations</option>
                  <option value="exceeds_expectations">Exceeds Expectations</option>
                </select>
                <Button onClick={handleSubmitManager} className="text-xs px-3 py-1.5">
                  Submit Manager Assessment
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>

      {showCreateCycle && (
        <CreateCycleModal onClose={() => setShowCreateCycle(false)} onCreated={loadCycles} />
      )}
    </>
  );
}
