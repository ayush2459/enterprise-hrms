"use client";

import { Suspense, useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, FileText, WalletCards } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkspaceShell } from "@/components/workspaces/WorkspaceShell";
import { AccountSettingsCard } from "@/components/workspaces/AccountSettingsCard";
import { authService } from "@/services/auth.service";
import { employeeService } from "@/services/employee.service";
import { leaveService } from "@/services/leave.service";
import { attendanceService } from "@/services/attendance.service";
import { teamService } from "@/services/team.service";
import { payrollService } from "@/services/payroll.service";
import type { EmployeeFull, LeaveBalance, LeaveRequest, LeaveType, PayrollRecord, User, AttendanceSummary, OrgSnippet } from "@/types";

function MyWorkspacePageContent() {
  const router = useRouter();
  const search = useSearchParams();
  const tab = search.get("tab") || "home";
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EmployeeFull | null>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [org, setOrg] = useState<OrgSnippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [form, setForm] = useState({ type: "", start: "", end: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const me = await authService.me();
      if (me.role !== "employee") {
        router.replace(me.role === "reporting_manager" ? "/manager" : "/dashboard");
        return;
      }
      setUser(me);
      const mine = await employeeService.getMyProfile();
      setProfile(mine);
      const [b, l, t, p, a, o] = await Promise.all([
        leaveService.getBalance(mine.id),
        leaveService.listForEmployee(mine.id),
        leaveService.listTypes(),
        payrollService.listForEmployee(mine.id),
        attendanceService.getSummary(mine.id),
        teamService.getOrgSnippet(mine.id),
      ]);
      setBalances(b);
      setLeaves(l);
      setTypes(t);
      setPayroll(p);
      setAttendance(a);
      setOrg(o);
      if (!form.type && t[0]) setForm((x) => ({ ...x, type: t[0].id }));
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Unable to load your workspace.");
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

  const totalRemaining = balances.reduce((sum, x) => sum + x.days_remaining, 0);
  const pending = leaves.filter((x) => x.status === "pending").length;
  const latestPay = [...payroll].sort((a,b) => b.month.localeCompare(a.month))[0];

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !form.type || !form.start || !form.end) return;
    setSaving(true);
    try {
      await leaveService.apply(profile.id, form.type, form.start, form.end, form.reason);
      setShowApply(false);
      setForm((x) => ({ ...x, start: "", end: "", reason: "" }));
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Unable to submit leave request.");
    } finally {
      setSaving(false);
    }
  };

  const firstName = profile?.full_name?.split(" ")[0] || "there";

  return (
    <WorkspaceShell role="employee" title="My Workspace" subtitle="Premium HRMS self-service" name={profile?.full_name || "Employee"}>
      <div className="min-h-[calc(100vh-64px)] bg-[#f5f7fb] px-5 py-6 md:px-8">
        <div className="mx-auto max-w-[1400px]">
          <section className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-[#18366f] via-[#2459c7] to-[#2f6df6] p-7 text-white shadow-[0_18px_45px_rgba(37,99,235,.18)] md:p-8">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-100/80">Employee self-service</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Welcome back, {firstName}</h2>
                <p className="mt-1 text-sm text-blue-50/80">{profile?.designation || "Employee"} · {profile?.department || "Organization"}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold">
                  <span className="rounded-full bg-white/10 px-3 py-1.5">{profile?.employee_id || "Employee"}</span>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1.5 text-emerald-100">{profile?.status || "Active"}</span>
                </div>
              </div>
              <button onClick={() => setShowApply(true)} className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-lg hover:-translate-y-0.5">
                + Apply for Leave <ArrowUpRight size={14} />
              </button>
            </div>
          </section>

          {error && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">{error}</div>}

          <div className="mt-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              ["Leave balance", `${totalRemaining} days`, `${balances.length} active policies`, CalendarDays],
              ["Attendance", attendance ? `${attendance.present} present` : "—", attendance ? `${attendance.absent} absent · ${attendance.on_leave} leave` : "Live summary", Clock3],
              ["Latest net pay", latestPay ? `₹${latestPay.net_pay.toLocaleString("en-IN")}` : "—", latestPay?.month || "No payroll record", WalletCards],
              ["Leave requests", pending, `${leaves.length} total requests`, CheckCircle2],
            ].map(([label, value, note, Icon]: any) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,.035)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,23,42,.08)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Icon size={18}/></div>
                <div className="mt-4 text-2xl font-bold tracking-tight">{loading ? "—" : value}</div>
                <div className="mt-1 text-xs font-semibold text-slate-600">{label}</div>
                <div className="mt-2 text-[10px] font-medium text-slate-400">{note}</div>
              </div>
            ))}
          </div>

          {(tab === "home" || tab === "leaves") && (
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.9fr]">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h3 className="text-sm font-bold">My leave requests</h3>
                  <p className="mt-1 text-[10px] text-slate-400">Live status from your HRMS.</p>
                </div>
                {leaves.length ? leaves.slice(0,8).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0">
                    <div className="min-w-0 flex-1"><p className="text-xs font-bold">{types.find((x) => x.id === item.leave_type_id)?.name || "Leave"}</p><p className="mt-0.5 text-[10px] text-slate-400">{item.start_date} → {item.end_date}</p></div>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${item.status === "approved" ? "bg-emerald-50 text-emerald-700" : item.status === "rejected" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{item.status}</span>
                  </div>
                )) : <div className="px-5 py-12 text-center text-xs text-slate-400">No leave requests yet.</div>}
              </section>

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-bold">Leave balances</h3><p className="mt-1 text-[10px] text-slate-400">Current available balances.</p></div>
                {balances.length ? balances.map((b) => (
                  <div key={b.leave_type_id} className="border-b border-slate-100 px-5 py-4 last:border-0">
                    <div className="flex items-center justify-between"><p className="text-xs font-bold">{b.leave_type_name}</p><p className="text-xs font-bold text-blue-600">{b.days_remaining}</p></div>
                    <p className="mt-1 text-[10px] text-slate-400">{b.days_used} used of {b.annual_quota_days}</p>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{width: `${Math.min(100,(b.days_used/Math.max(1,b.annual_quota_days))*100)}%`}} /></div>
                  </div>
                )) : <div className="px-5 py-12 text-center text-xs text-slate-400">No leave balance available.</div>}
              </section>
            </div>
          )}

          {tab === "attendance" && attendance && (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center gap-3"><Clock3 className="text-blue-600"/><div><h3 className="text-sm font-bold">My attendance</h3><p className="text-[10px] text-slate-400">Current summary from the HRMS.</p></div></div>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
                {Object.entries(attendance).map(([key,value]) => <div key={key} className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xl font-bold">{value}</p><p className="mt-1 text-[10px] capitalize text-slate-400">{key.replace("_"," ")}</p></div>)}
              </div>
            </section>
          )}

          {tab === "payroll" && (
            <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-bold">My payroll</h3><p className="mt-1 text-[10px] text-slate-400">Payroll records visible to your account.</p></div>
              {payroll.length ? payroll.map((p) => <div key={p.id} className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><WalletCards size={16}/></div><div className="min-w-[140px] flex-1"><p className="text-xs font-bold">{p.month}</p><p className="text-[10px] text-slate-400">Basic ₹{p.basic_pay.toLocaleString("en-IN")} · Allowances ₹{p.allowances.toLocaleString("en-IN")}</p></div><div className="text-right"><p className="text-sm font-bold">₹{p.net_pay.toLocaleString("en-IN")}</p><p className="text-[9px] text-slate-400">{p.status}</p></div></div>) : <div className="px-5 py-12 text-center text-xs text-slate-400">No payroll records available.</div>}
            </section>
          )}

          {tab === "documents" && (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
              <FileText className="text-blue-600"/>
              <h3 className="mt-3 text-sm font-bold">My documents</h3>
              <p className="mt-1 text-xs text-slate-400">Use the existing Documents module for uploads and verification.</p>
              <button onClick={() => router.push("/documents")} className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">Open Documents</button>
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

          {(tab === "home" || tab === "profile") && (
            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-sm font-bold">Reporting line</h3>
              <p className="mt-1 text-[10px] text-slate-400">Live from HR — updates automatically when your reporting manager changes.</p>
              {org?.manager ? (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">{org.manager.full_name[0]}</div>
                  <div>
                    <p className="text-xs font-bold">{org.manager.full_name}</p>
                    <p className="text-[10px] text-slate-400">{org.manager.designation || "Manager"} · {org.manager.department || "—"}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400">No reporting manager assigned yet.</p>
              )}
            </section>
          )}

          {tab === "settings" && (
            <section className="mt-5">
              <AccountSettingsCard user={user} onUserUpdated={setUser} />
            </section>
          )}

          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-[10px] text-blue-700">
            <b>Local preview mode.</b> This workspace reads the same live HRMS APIs. Changes flow back to HR and manager views after refresh.
          </div>
        </div>
      </div>

      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <form onSubmit={apply} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between"><div><h3 className="text-base font-bold">Apply for leave</h3><p className="mt-1 text-[10px] text-slate-400">Your request will follow the existing HRMS approval rules.</p></div><button type="button" onClick={() => setShowApply(false)} className="text-slate-400">×</button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] font-semibold text-slate-600">Leave type<select required value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs"><option value="">Select</option>{types.filter((x)=>x.is_active && (x.eligibility_gender==="all" || !x.eligibility_gender || x.eligibility_gender===profile?.gender)).map((x)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
              <label className="text-[11px] font-semibold text-slate-600">Start date<input required type="date" value={form.start} onChange={(e)=>setForm({...form,start:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs"/></label>
              <label className="text-[11px] font-semibold text-slate-600">End date<input required type="date" value={form.end} onChange={(e)=>setForm({...form,end:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs"/></label>
              <label className="text-[11px] font-semibold text-slate-600 sm:col-span-2">Reason<textarea value={form.reason} onChange={(e)=>setForm({...form,reason:e.target.value})} className="mt-1 min-h-24 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs" placeholder="Optional reason"/></label>
            </div>
            <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={()=>setShowApply(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold">Cancel</button><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">{saving ? "Submitting..." : "Submit request"}</button></div>
          </form>
        </div>
      )}
    </WorkspaceShell>
  );
}

export default function MyWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-slate-500">
          Loading workspace…
        </div>
      }
    >
      <MyWorkspacePageContent />
    </Suspense>
  );
}
