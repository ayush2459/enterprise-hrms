"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  ShieldAlert,
  HeartPulse,
  FileClock,
  CalendarDays,
  Upload,
  ShieldCheck,
  Cake,
  PartyPopper,
  ClipboardList,
  FileCheck2,
  UserCheck2,
  Contact,
  Sparkles,
  Plus,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { KPICard } from "@/components/dashboard/KPICard";
import { Loader } from "@/components/common/Loader";
import { AddEventModal } from "@/components/dashboard/AddEventModal";
import { dashboardService } from "@/services/dashboard.service";
import { useAuthStore } from "@/store/auth.store";
import type { DashboardSummary } from "@/types";

const DEPT_COLORS = ["#3A66DB", "#0EA5E9", "#16A34A", "#D97706", "#DC2626", "#8B5CF6", "#64748B"];
const AVATAR_COLORS = [
  "bg-brand/10 text-brand",
  "bg-accent-soft text-accent",
  "bg-green-50 text-green-600",
  "bg-amber-50 text-amber-600",
  "bg-purple-50 text-purple-600",
  "bg-rose-50 text-rose-600",
];

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

const QUICK_LINKS = [
  { href: "/employees", label: "Add New Employee", icon: UserPlus },
  { href: "/documents", label: "Upload Document", icon: Upload },
  { href: "/policies", label: "View All Policies", icon: ShieldCheck },
];

function greetingName(email?: string) {
  if (!email) return "";
  const local = email.split("@")[0];
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-ink-faint">
        <Icon size={16} />
      </div>
      <p className="text-xs text-ink-faint">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);

  const loadSummary = () => {
    dashboardService
      .getSummary()
      .then(setSummary)
      .catch(() => setError("Could not load dashboard data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Topbar
        title={`Welcome back${user ? `, ${greetingName(user.official_email)}` : ""}`}
        subtitle="Overview of your organization"
      />
      <div className="p-8 space-y-6">
        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark via-brand-dark to-brand px-8 py-7 text-white shadow-lift animate-fade-up">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-brand-light/20 blur-2xl" />
          <div className="relative flex items-center gap-2 text-xs font-medium text-white/60">
            <Sparkles size={13} />
            {today}
          </div>
          <h1 className="relative mt-1 font-display text-2xl font-semibold tracking-tight">
            Your organization at a glance
          </h1>
          <p className="relative mt-1 text-sm text-white/70">
            Live counts pulled straight from every module — nothing cached.
          </p>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading || !summary ? (
          <Loader label="Loading dashboard..." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KPICard label="Total Employees" value={summary.total_employees} icon={Users} accent="brand" />
              <KPICard label="New Joiners (30d)" value={summary.new_joiners_30d} icon={UserPlus} accent="success" />
              <KPICard label="Pending BGV" value={summary.pending_bgv} icon={FileClock} accent="warning" />
              <KPICard label="Insurance Pending" value={summary.insurance_pending} icon={HeartPulse} accent="accent" />
              <KPICard
                label="Docs Awaiting Verification"
                value={summary.pending_document_verifications}
                icon={ShieldAlert}
                accent="warning"
              />
              <KPICard label="On Leave Today" value={summary.leaves_today} icon={CalendarDays} accent="accent" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 animate-fade-up" style={{ animationDelay: "80ms" }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-ink">Employee Headcount</h2>
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink-faint">This Year</span>
                </div>
                {summary.headcount_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={summary.headcount_trend}>
                      <defs>
                        <linearGradient id="headcountFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3A66DB" stopOpacity={0.28} />
                          <stop offset="100%" stopColor="#3A66DB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F7" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(m: string) =>
                          new Date(`${m}-01`).toLocaleDateString(undefined, { month: "short" })
                        }
                        tick={{ fontSize: 12, fill: "#9494A3" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#9494A3" }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip
                        labelFormatter={(m: string) =>
                          new Date(`${m}-01`).toLocaleDateString(undefined, { month: "long", year: "numeric" })
                        }
                        contentStyle={{ borderRadius: 10, border: "1px solid #EEF1F7", fontSize: 12, boxShadow: "0 8px 24px rgba(20,20,26,0.08)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#3A66DB"
                        strokeWidth={2.5}
                        fill="url(#headcountFill)"
                        dot={{ r: 3, fill: "#3A66DB", strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={Users} label="No joining-date data yet." />
                )}
              </Card>

              <Card className="animate-fade-up" style={{ animationDelay: "140ms" }}>
                <h2 className="mb-4 font-display text-sm font-semibold text-ink">Employees by Dept</h2>
                {summary.employees_by_department.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width={120} height={120}>
                      <PieChart>
                        <Pie
                          data={summary.employees_by_department}
                          dataKey="count"
                          nameKey="department"
                          innerRadius={38}
                          outerRadius={58}
                          paddingAngle={2}
                        >
                          {summary.employees_by_department.map((_, i) => (
                            <Cell key={i} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EEF1F7", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <ul className="flex-1 space-y-1.5 text-xs">
                      {summary.employees_by_department.map((d, i) => (
                        <li key={d.department} className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5 text-ink-soft">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}
                            />
                            {d.department}
                          </span>
                          <span className="font-medium text-ink">{d.count}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <EmptyState icon={Users} label="No department data yet." />
                )}
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <Card className="animate-fade-up" style={{ animationDelay: "180ms" }}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-ink">Recent Joiners</h2>
                  <Link href="/employees" className="text-xs text-brand hover:underline">
                    View All
                  </Link>
                </div>
                {summary.recent_joiners.length > 0 ? (
                  <ul className="space-y-3">
                    {summary.recent_joiners.map((j, i) => (
                      <li key={j.id} className="flex items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}
                        >
                          {j.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{j.full_name}</p>
                          <p className="truncate text-xs text-ink-faint">{j.designation ?? "—"}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState icon={UserPlus} label="No employees yet." />
                )}
              </Card>

              <Card className="animate-fade-up" style={{ animationDelay: "220ms" }}>
                <h2 className="mb-3 font-display text-sm font-semibold text-ink">Pending Approvals</h2>
                <ul className="space-y-2.5">
                  {[
                    { label: "Leave Requests", value: summary.pending_approvals.leave_requests, icon: CalendarDays, color: "bg-blue-50 text-blue-600" },
                    { label: "Document Verifications", value: summary.pending_approvals.document_verifications, icon: FileCheck2, color: "bg-amber-50 text-amber-600" },
                    { label: "Background Checks", value: summary.pending_approvals.background_checks, icon: UserCheck2, color: "bg-purple-50 text-purple-600" },
                    { label: "Dependent Verifications", value: summary.pending_approvals.dependent_verifications, icon: Contact, color: "bg-rose-50 text-rose-600" },
                  ].map((row) => (
                    <li key={row.label} className="flex items-center justify-between rounded-lg px-1.5 py-1.5 transition-colors hover:bg-surface-muted">
                      <span className="flex items-center gap-2 text-sm text-ink-soft">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${row.color}`}>
                          <row.icon size={12} />
                        </span>
                        {row.label}
                      </span>
                      <span className="font-display text-sm font-semibold text-ink">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="animate-fade-up" style={{ animationDelay: "260ms" }}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-ink">Policy Updates</h2>
                  <Link href="/policies" className="text-xs text-brand hover:underline">
                    View All
                  </Link>
                </div>
                {summary.policy_updates.length > 0 ? (
                  <ul className="space-y-3">
                    {summary.policy_updates.map((p) => (
                      <li key={p.id} className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
                          <ShieldCheck size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">{p.title}</p>
                          <p className="text-xs text-ink-faint">v{p.version} · {p.category}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState icon={ShieldCheck} label="No policies published yet." />
                )}
              </Card>

              <Card className="animate-fade-up" style={{ animationDelay: "300ms" }}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-sm font-semibold text-ink">Upcoming Events</h2>
                  {isHR && (
                    <button
                      onClick={() => setShowAddEventModal(true)}
                      className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  )}
                </div>
                {summary.upcoming_events.length > 0 ? (
                  <ul className="space-y-3">
                    {summary.upcoming_events.map((ev, i) => {
                      const icon =
                        ev.event_type === "birthday" ? (
                          <Cake size={14} />
                        ) : ev.event_type === "work_anniversary" ? (
                          <PartyPopper size={14} />
                        ) : (
                          <CalendarDays size={14} />
                        );
                      const label =
                        ev.event_type === "birthday"
                          ? "Birthday"
                          : ev.event_type === "work_anniversary"
                          ? "Work Anniversary"
                          : ev.category ?? "Company Event";
                      return (
                        <li key={i} className="flex items-start gap-2.5">
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                            {icon}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink">{ev.full_name}</p>
                            <p className="text-xs text-ink-faint">
                              {label} ·{" "}
                              {new Date(ev.event_date).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <EmptyState icon={PartyPopper} label="Nothing in the next 30 days." />
                )}
              </Card>
            </div>

            <Card className="animate-fade-up" style={{ animationDelay: "340ms" }}>
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList size={15} className="text-ink-faint" />
                <h2 className="font-display text-sm font-semibold text-ink">Quick Links</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group flex items-center gap-2 rounded-lg border border-gray-100 px-3.5 py-2.5 text-sm text-ink-soft transition-all duration-150 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-surface-muted hover:text-brand hover:shadow-soft"
                  >
                    <Icon size={15} className="transition-transform group-hover:scale-110" />
                    {label}
                  </Link>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>

      {showAddEventModal && (
        <AddEventModal onClose={() => setShowAddEventModal(false)} onAdded={loadSummary} />
      )}
    </>
  );
}
