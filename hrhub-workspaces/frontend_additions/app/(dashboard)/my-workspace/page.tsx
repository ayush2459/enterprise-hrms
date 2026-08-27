"use client";

import { useEffect, useState } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import { HeroBanner, MetricCard, PanelCard, Row, Pill } from "@/components/workspace/PreviewPrimitives";
import ApplyLeaveModal from "@/components/leaves/ApplyLeaveModal"; // reuse existing modal
import api from "@/lib/api"; // adjust import to match your actual lib/api.ts export

interface MeSummary {
  full_name: string;
  designation?: string;
  department?: string;
  employee_code?: string;
  employment_type?: string;
  status?: string;
  leave_balance_days?: number;
  active_leave_policies?: number;
  attendance_present?: number;
  attendance_leave?: number;
  attendance_absent?: number;
  latest_net_pay?: string;
  latest_net_pay_month?: string;
  pending_leave_requests?: number;
  total_leave_requests?: number;
}

interface MyLeaveRow {
  id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "rejected";
}

export default function MyWorkspacePage() {
  const [summary, setSummary] = useState<MeSummary | null>(null);
  const [leaves, setLeaves] = useState<MyLeaveRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [summaryRes, leavesRes] = await Promise.all([
        api.get("/me/summary"),      // NOTE: new endpoint — see backend_additions
        api.get("/me/leave-requests"),
      ]);
      setSummary(summaryRes.data);
      setLeaves(leavesRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const nav = [
    { label: "My Workspace", icon: "◈", href: "/my-workspace", active: true },
    { label: "Attendance", icon: "◷", href: "/my-workspace/attendance" },
    { label: "Leaves", icon: "▣", href: "/my-workspace/leaves" },
    { label: "Payroll", icon: "₹", href: "/my-workspace/payroll" },
    { label: "Documents", icon: "▤", href: "/my-workspace/documents" },
    { label: "Profile", icon: "♙", href: "/my-workspace/profile" },
  ];

  return (
    <WorkspaceShell
      sectionLabel="My Workspace"
      navItems={nav}
      userName={summary?.full_name || "..."}
      userRole="employee"
    >
      <HeroBanner
        eyebrow="EMPLOYEE SELF-SERVICE"
        title={`Welcome back, ${summary?.full_name || ""}`}
        subtitle={`${summary?.designation || ""} · ${summary?.department || ""}`}
        chips={[summary?.employee_code || "", summary?.employment_type || "", summary?.status || ""].filter(Boolean)}
        actions={
          <>
            <button
              onClick={() => setShowApply(true)}
              className="bg-white text-[#1d4ed8] font-bold text-xs px-3.5 py-2.5 rounded-lg"
            >
              + Apply for Leave
            </button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3.5 my-4">
        <MetricCard label="Leave balance" value={`${summary?.leave_balance_days ?? "—"} days`} helper={`${summary?.active_leave_policies ?? 0} active leave policies`} />
        <MetricCard label="Attendance" value={`${summary?.attendance_present ?? "—"} present`} helper={`${summary?.attendance_leave ?? 0} leave · ${summary?.attendance_absent ?? 0} absent`} />
        <MetricCard label="Latest net pay" value={summary?.latest_net_pay || "—"} helper={summary?.latest_net_pay_month} />
        <MetricCard label="Leave requests" value={`${summary?.pending_leave_requests ?? 0} pending`} helper={`${summary?.total_leave_requests ?? 0} total requests`} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="My leave requests" subtitle="Track requests and approval status.">
          {loading && <div className="p-5 text-xs text-gray-400">Loading...</div>}
          {!loading && leaves.length === 0 && <div className="p-5 text-xs text-gray-400">No leave requests yet.</div>}
          {leaves.map((l) => (
            <Row key={l.id}>
              <div>
                <b className="text-xs">{l.leave_type}</b>
                <small className="block text-[10px] text-gray-400 mt-1">{l.start_date} – {l.end_date}</small>
              </div>
              <Pill status={l.status} />
            </Row>
          ))}
        </PanelCard>

        <PanelCard title="Notifications" subtitle="Recent updates on your requests.">
          <div className="p-5 text-xs text-gray-400">Notifications feed wires to /me/notifications (see backend_additions).</div>
        </PanelCard>
      </div>

      {showApply && (
        <ApplyLeaveModal onClose={() => setShowApply(false)} onSuccess={() => { setShowApply(false); load(); }} />
      )}
    </WorkspaceShell>
  );
}
