"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Check, Clock3, Users, CalendarDays, TrendingUp, X, ArrowUpRight } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { WorkspaceShell } from "@/components/workspaces/WorkspaceShell";
import { AccountSettingsCard } from "@/components/workspaces/AccountSettingsCard";
import { authService } from "@/services/auth.service";
import { employeeService } from "@/services/employee.service";
import { teamService } from "@/services/team.service";
import { leaveService } from "@/services/leave.service";
import { attendanceService } from "@/services/attendance.service";
import { performanceService } from "@/services/performance.service";
import type { EmployeeFull, LeaveRequest, PerformanceReview, ReviewCycle, TeamMember, User } from "@/types";

type TeamRow = TeamMember & { attendance?: { present: number; on_leave: number; absent: number } };

function ManagerPageContent() {
  const router = useRouter();
  const search = useSearchParams();
  const tab = search.get("tab") || "overview";
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EmployeeFull | null>(null);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [pending, setPending] = useState<Array<LeaveRequest & { employeeName: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [activeCycle, setActiveCycle] = useState<ReviewCycle | null>(null);
  const [reviews, setReviews] = useState<Record<string, PerformanceReview | null>>({});
  const [perfLoading, setPerfLoading] = useState(false);
  const [assessDraft, setAssessDraft] = useState<Record<string, { text: string; rating: string }>>({});

  const loadPerformance = async () => {
    if (team.length === 0) return;
    setPerfLoading(true);
    try {
      const allCycles = await performanceService.listCycles();
      setCycles(allCycles);
      const active = allCycles.find((c) => c.status === "active") ?? allCycles[0] ?? null;
      setActiveCycle(active);
      if (active) {
        const perTeamMember = await Promise.all(
          team.map(async (person) => {
            const list = await performanceService.listForEmployee(person.id);
            const forCycle = list.find((r) => r.review_cycle_id === active.id) ?? null;
            return [person.id, forCycle] as const;
          })
        );
        setReviews(Object.fromEntries(perTeamMember));
      }
    } catch (err) {
      console.error("Failed to load performance data:", err);
    } finally {
      setPerfLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "performance" && team.length > 0) {
      loadPerformance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, team.length]);

  const load = async () => {
    try {
      setError("");
      const me = await authService.me();
      if (me.role !== "reporting_manager") {
        router.replace(me.role === "employee" ? "/my-workspace" : "/dashboard");
        return;
      }
      setUser(me);
      if (!me.employee_id) throw new Error("Manager account is not linked to an employee record.");
      const mine = await employeeService.getMyProfile();
      setProfile(mine);
      const org = await teamService.getOrgSnippet(mine.id);
      const reports = org.direct_reports || [];

      const rows = await Promise.all(
        reports.map(async (person) => {
          try {
            const a = await attendanceService.getSummary(person.id);
            return { ...person, attendance: a };
          } catch {
            return person;
          }
        })
      );
      setTeam(rows);

      const leaveSets = await Promise.all(
        reports.map(async (person) => {
          try {
            const leaves = await leaveService.listForEmployee(person.id);
            return leaves.filter((x) => x.status === "pending").map((x) => ({ ...x, employeeName: person.full_name }));
          } catch {
            return [];
          }
        })
      );
      setPending(leaveSets.flat());
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Unable to load manager workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 8000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") load();
    });
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.type === "manager_assigned" || detail?.type === "team_updated" || detail?.type === "role_changed") {
        load();
      }
    };
    window.addEventListener("hrhub:realtime", handler);
    return () => window.removeEventListener("hrhub:realtime", handler);
  }, []);

  const present = useMemo(() => team.filter((x) => (x.attendance?.present ?? 0) > 0).length, [team]);
  const onLeave = useMemo(() => team.filter((x) => (x.attendance?.on_leave ?? 0) > 0 || x.status === "on_leave").length, [team]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    try {
      await leaveService.decide(id, status);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Could not update leave request.");
    } finally {
      setBusy(null);
    }
  };

  const displayName = profile?.full_name || "Manager";

  return (
    <WorkspaceShell role="manager" title="Manager Workspace" subtitle="Premium HRMS workspace" name={displayName}>
      <div className="min-h-[calc(100vh-64px)] bg-[#f5f7fb] px-5 py-6 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <section className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#18366f] via-[#2459c7] to-[#2f6df6] p-7 text-white shadow-[0_18px_45px_rgba(37,99,235,.18)] md:p-8">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100/80">Manager workspace</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Good morning, {displayName.split(" ")[0]}</h2>
                <p className="mt-1 text-sm text-blue-50/80">{profile?.department || "Team"} · {profile?.designation || "People Manager"}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold">
                  <span className="rounded-full bg-white/10 px-3 py-1.5">{team.length} Direct Reports</span>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1.5 text-emerald-100">Live team data</span>
                </div>
              </div>
              <button onClick={() => router.push("/manager?tab=approvals")} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-lg hover:-translate-y-0.5">
                Review approvals <ArrowUpRight size={14} />
              </button>
            </div>
          </section>

          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</div>}

          <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              ["Team size", team.length, `${present} present today`, Users],
              ["Approvals", pending.length, "Need attention", Check],
              ["On leave", onLeave, `${team.length ? ((onLeave / team.length) * 100).toFixed(1) : "0.0"}% of team`, CalendarDays],
              ["Attendance", team.length ? `${((present / team.length) * 100).toFixed(1)}%` : "0%", "Based on live summaries", Clock3],
            ].map(([label, value, note, Icon]: any) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.035)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,.08)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={18}/></div>
                <div className="mt-4 text-2xl font-bold tracking-tight">{loading ? "—" : value}</div>
                <div className="mt-1 text-xs font-semibold text-slate-600">{label}</div>
                <div className="mt-2 text-[10px] font-medium text-slate-400">{note}</div>
              </div>
            ))}
          </div>

          {(tab === "overview" || tab === "approvals") && (
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.9fr]">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,.035)]">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-bold">Pending approvals</h3>
                  <p className="mt-1 text-[10px] text-slate-400">Requests from your direct reports.</p>
                </div>
                {pending.length ? pending.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">{item.employeeName[0]}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold">{item.employeeName}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{item.start_date} → {item.end_date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button disabled={busy === item.id} onClick={() => decide(item.id, "approved")} className="rounded-lg bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100"><Check size={13}/></button>
                      <button disabled={busy === item.id} onClick={() => decide(item.id, "rejected")} className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-bold text-red-700 hover:bg-red-100"><X size={13}/></button>
                    </div>
                  </div>
                )) : <div className="px-5 py-12 text-center text-xs text-slate-400">No pending approvals.</div>}
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,.035)]">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-bold">My team</h3>
                  <p className="mt-1 text-[10px] text-slate-400">Live organizational information.</p>
                </div>
                {team.length ? team.slice(0, 8).map((person) => (
                  <div key={person.id} className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5 last:border-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">{person.full_name[0]}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold">{person.full_name}</p>
                      <p className="truncate text-[10px] text-slate-400">{person.department || "—"} · {person.designation || "—"}</p>
                    </div>
                    <span className={`text-[10px] font-bold ${person.status === "on_leave" ? "text-amber-600" : "text-emerald-600"}`}>{person.status === "on_leave" ? "On Leave" : "Active"}</span>
                  </div>
                )) : <div className="px-5 py-12 text-center text-xs text-slate-400">No direct reports found.</div>}
              </section>
            </div>
          )}

          {tab === "team" && (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-bold">Team directory</h3><p className="mt-1 text-[10px] text-slate-400">Attendance and organizational status from the live API.</p></div>
              <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                {team.map((person) => (
                  <div key={person.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">{person.full_name[0]}</div>
                      <div><p className="text-xs font-bold">{person.full_name}</p><p className="text-[10px] text-slate-400">{person.designation || "Employee"}</p></div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-slate-50 p-2"><p className="text-sm font-bold">{person.attendance?.present ?? "—"}</p><p className="text-[9px] text-slate-400">Present</p></div>
                      <div className="rounded-lg bg-slate-50 p-2"><p className="text-sm font-bold">{person.attendance?.on_leave ?? "—"}</p><p className="text-[9px] text-slate-400">Leave</p></div>
                      <div className="rounded-lg bg-slate-50 p-2"><p className="text-sm font-bold">{person.attendance?.absent ?? "—"}</p><p className="text-[9px] text-slate-400">Absent</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "attendance" && (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3"><Clock3 className="text-blue-600"/><div><h3 className="text-sm font-bold">Team attendance</h3><p className="text-[10px] text-slate-400">Live summaries for direct reports.</p></div></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {team.map((person) => <div key={person.id} className="rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold">{person.full_name}</p><p className="mt-2 text-[11px] text-slate-500">Present {person.attendance?.present ?? 0} · Leave {person.attendance?.on_leave ?? 0} · Absent {person.attendance?.absent ?? 0}</p></div>)}
              </div>
            </section>
          )}

          {tab === "performance" && (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="text-sm font-bold">Team performance reviews</h3>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {activeCycle ? `Cycle: ${activeCycle.name}` : "No review cycle found."}
                  </p>
                </div>
                <button onClick={() => router.push("/performance")} className="text-xs font-medium text-blue-600 hover:underline">
                  Open full HR module
                </button>
              </div>

              {perfLoading && <p className="p-5 text-xs text-slate-400">Loading reviews…</p>}

              {!perfLoading && activeCycle && (
                <div className="divide-y divide-slate-100">
                  {team.map((person) => {
                    const review = reviews[person.id];
                    const draft = assessDraft[person.id] || { text: review?.manager_assessment || "", rating: review?.rating || "not_rated" };
                    return (
                      <div key={person.id} className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold">{person.full_name}</p>
                            <p className="text-[10px] text-slate-400">{person.designation || "Employee"}</p>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                            {review ? review.status.replace(/_/g, " ") : "not started"}
                          </span>
                        </div>

                        {!review && (
                          <button
                            onClick={async () => {
                              const created = await performanceService.initiateReview(activeCycle.id, person.id);
                              setReviews((r) => ({ ...r, [person.id]: created }));
                            }}
                            className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-blue-600 hover:bg-blue-50"
                          >
                            Start review
                          </button>
                        )}

                        {review && (
                          <div className="mt-3 space-y-2">
                            {review.self_assessment && (
                              <p className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
                                <span className="font-semibold">Self-assessment: </span>{review.self_assessment}
                              </p>
                            )}
                            <textarea
                              value={draft.text}
                              onChange={(e) => setAssessDraft((d) => ({ ...d, [person.id]: { ...draft, text: e.target.value } }))}
                              placeholder="Manager assessment…"
                              className="w-full rounded-lg border border-slate-200 p-2 text-xs"
                              rows={2}
                            />
                            <div className="flex items-center gap-2">
                              <select
                                value={draft.rating}
                                onChange={(e) => setAssessDraft((d) => ({ ...d, [person.id]: { ...draft, rating: e.target.value } }))}
                                className="rounded-lg border border-slate-200 px-2 py-1.5 text-[11px]"
                              >
                                <option value="not_rated">Not rated</option>
                                <option value="below_expectations">Below expectations</option>
                                <option value="meets_expectations">Meets expectations</option>
                                <option value="exceeds_expectations">Exceeds expectations</option>
                              </select>
                              <button
                                onClick={async () => {
                                  const updated = await performanceService.submitManagerAssessment(review.id, draft.text, draft.rating as any);
                                  setReviews((r) => ({ ...r, [person.id]: updated }));
                                }}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white"
                              >
                                Save assessment
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {!perfLoading && !activeCycle && (
                <p className="p-5 text-xs text-slate-400">No review cycle has been created yet. Ask HR to create one from the full performance module.</p>
              )}
            </section>
          )}

          {tab === "profile" && profile && (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-bold">My profile</h3>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[["Name",profile.full_name],["Employee ID",profile.employee_id],["Email",profile.personal_email],["Mobile",profile.mobile_number],["Department",profile.department],["Designation",profile.designation],["Joining date",profile.date_of_joining]].map(([label,value]) => <div key={label}><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-xs font-semibold text-slate-800">{value || "—"}</p></div>)}
              </div>
            </section>
          )}

          {tab === "settings" && (
            <section className="mt-5">
              <AccountSettingsCard user={user} onUserUpdated={setUser} />
            </section>
          )}

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-[10px] text-blue-700">
            <b>Local preview mode.</b> This workspace reads from the same backend as HR. Changes made here are real API actions; GitHub and production are untouched.
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

export default function ManagerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-slate-500">Loading workspace…</div>}>
      <ManagerPageContent />
    </Suspense>
  );
}
