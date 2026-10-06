"use client";

import { useEffect, useState } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import { HeroBanner, MetricCard, PanelCard, Row } from "@/components/workspace/PreviewPrimitives";
import api from "@/lib/api"; // adjust import to match your actual lib/api.ts export

interface TeamMember {
  id: number;
  name: string;
  designation?: string;
  department?: string;
  attendance_status?: string;
}

interface PendingApproval {
  id: number;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
}

export default function ManagerWorkspacePage() {
  const [managerName, setManagerName] = useState("Manager");
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [pending, setPending] = useState<PendingApproval[]>([]);
  const [attendancePct, setAttendancePct] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [teamRes, pendingRes] = await Promise.all([
        api.get("/manager/team"),
        api.get("/manager/approvals/pending"),
      ]);
      setTeam(teamRes.data);
      setPending(pendingRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id: number, approve: boolean) => {
    await api.post(`/manager/approvals/${id}/decision`, { approve });
    load();
  };

  const nav = [
    { label: "Overview", icon: "◈", href: "/manager", active: true },
    { label: "My Team", icon: "▤", href: "/manager/team" },
    { label: "Leave Approvals", icon: "▣", href: "/manager/leave-approvals" },
    { label: "Attendance", icon: "◷", href: "/manager/attendance" },
    { label: "Performance", icon: "★", href: "/manager/performance" },
    { label: "Approval Inbox", icon: "✓", href: "/manager/approvals" },
  ];

  const onLeaveToday = team.filter((t) => t.attendance_status === "on_leave").length;

  return (
    <WorkspaceShell sectionLabel="Manager Workspace" navItems={nav} userName={managerName} userRole="manager">
      <HeroBanner
        eyebrow="MANAGER WORKSPACE"
        title={`Good morning, ${managerName}`}
        subtitle="Engineering · Team Lead"
        chips={[`${team.length} Direct Reports`, "Active"]}
        actions={
          <>
            <a href="/manager/approvals" className="bg-white text-[#1d4ed8] font-bold text-xs px-3.5 py-2.5 rounded-lg">+ Review Approvals</a>
            <a href="/manager/notifications" className="bg-white/10 text-white border border-white/20 font-bold text-xs px-3.5 py-2.5 rounded-lg">Notifications</a>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-3.5 my-4">
        <MetricCard label="Team size" value={`${team.length}`} helper={`${team.length - onLeaveToday} present today`} />
        <MetricCard label="Approvals" value={`${pending.length} pending`} helper="Needs attention" />
        <MetricCard label="On leave" value={`${onLeaveToday} today`} helper={team.length ? `${Math.round((onLeaveToday / team.length) * 100)}% of team` : "—"} />
        <MetricCard label="Attendance" value={attendancePct !== null ? `${attendancePct}%` : "—"} helper="This month" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="Pending approvals" subtitle="Items requiring attention and action.">
          {loading && <div className="p-5 text-xs text-gray-400">Loading...</div>}
          {!loading && pending.length === 0 && <div className="p-5 text-xs text-gray-400">No pending approvals.</div>}
          {pending.map((p) => (
            <Row key={p.id}>
              <div>
                <b className="text-xs">{p.employee_name}</b>
                <small className="block text-[10px] text-gray-400 mt-1">{p.leave_type} · {p.start_date} – {p.end_date}</small>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => decide(p.id, true)} className="text-[10px] font-bold px-2.5 py-1.5 rounded bg-[#fffbeb] text-[#b45309]">Approve</button>
                <button onClick={() => decide(p.id, false)} className="text-[10px] font-bold px-2.5 py-1.5 rounded bg-[#fef2f2] text-[#b91c1c]">Reject</button>
              </div>
            </Row>
          ))}
        </PanelCard>

        <PanelCard title="My team" subtitle="Live organizational information.">
          {team.map((m) => (
            <Row key={m.id}>
              <div>
                <b className="text-xs">{m.name}</b>
                <small className="block text-[10px] text-gray-400 mt-1">{m.department} · {m.designation}</small>
              </div>
              <span className="text-[10px] text-gray-500">{m.attendance_status || "—"}</span>
            </Row>
          ))}
        </PanelCard>
      </div>
    </WorkspaceShell>
  );
}
