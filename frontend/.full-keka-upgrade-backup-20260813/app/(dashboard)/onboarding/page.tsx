"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { onboardingService } from "@/services/onboarding.service";
import type { OnboardingStatus } from "@/types";

function ChecklistGroup({ label, items }: { label: string; items: { label: string; complete: boolean }[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm">
            {item.complete ? (
              <CheckCircle2 size={16} className="text-green-600" />
            ) : (
              <Circle size={16} className="text-gray-300" />
            )}
            <span className={item.complete ? "text-brand-dark" : "text-gray-500"}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OnboardingPage() {
  const [rows, setRows] = useState<OnboardingStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    onboardingService
      .list()
      .then(setRows)
      .catch(() => setError("Could not load onboarding data. This view is HR-only."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleComplete = async (employeeId: string) => {
    try {
      await onboardingService.markComplete(employeeId);
      load();
    } catch {
      setError("Could not mark onboarding complete.");
    }
  };

  return (
    <>
      <Topbar title="Onboarding" subtitle="New hires in progress" />
      <div className="p-8 space-y-4">
        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading ? (
          <Loader label="Loading onboarding checklist..." />
        ) : rows.length === 0 ? (
          <Card className="py-16 text-center text-gray-400">
            No employees currently onboarding. New hires appear here after converting a candidate in
            Recruitment.
          </Card>
        ) : (
          rows.map((row) => (
            <Card key={row.employee_id}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-brand-dark">{row.full_name}</h2>
                  {row.date_of_joining && (
                    <p className="text-xs text-gray-500">
                      Joining {new Date(row.date_of_joining).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => handleComplete(row.employee_id)}
                  disabled={!row.all_complete}
                  className="text-xs px-3 py-1.5"
                >
                  {row.all_complete ? "Mark Onboarding Complete" : "Checklist Incomplete"}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <ChecklistGroup label="Documents" items={row.documents} />
                <ChecklistGroup label="Background Verification" items={row.bgv} />
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
