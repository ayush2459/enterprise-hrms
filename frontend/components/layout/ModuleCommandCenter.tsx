"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Filter,
  GitBranch,
  HeartPulse,
  KanbanSquare,
  ListChecks,
  LockKeyhole,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  Users,
  WalletCards,
} from "lucide-react";

type ViewConfig = {
  label: string;
  /** Full path to navigate to. Omit to stay on current page (first/default tab). */
  href?: string;
};

type ModuleConfig = {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Users;
  accent: string;
  metrics: { label: string; value: string; delta: string; icon: typeof Users }[];
  views: ViewConfig[];
  /** Label on the CTA button */
  primary: string;
  /** Custom event dispatched when the CTA is clicked. Pages listen with window.addEventListener('hrm:action', ...) */
  primaryAction: string;
};

const CONFIG: Record<string, ModuleConfig> = {
  "/employees": {
    eyebrow: "People intelligence",
    title: "Employee command center",
    description: "Directory, workforce segmentation, status monitoring and high-speed employee actions.",
    icon: Users,
    accent: "from-blue-600 to-indigo-600",
    metrics: [
      { label: "Workforce",    value: "Live",  delta: "Directory synced",    icon: Users },
      { label: "Departments",  value: "Live",  delta: "Segmented view",      icon: Network },
      { label: "Status",       value: "Live",  delta: "Active / leave / former", icon: UserCheck },
      { label: "Actions",      value: "Quick", delta: "Bulk-ready workspace", icon: Sparkles },
    ],
    views: [
      { label: "Directory" },
      { label: "Analytics",         href: "/employees?view=analytics" },
      { label: "Departments",       href: "/employees?view=departments" },
      { label: "Former employees",  href: "/employees/former" },
    ],
    primary: "Add employee",
    primaryAction: "add-employee",
  },
  "/recruitment": {
    eyebrow: "Talent acquisition",
    title: "Recruitment command center",
    description: "Move from openings to interviews to offers with a visual pipeline and decision-focused workflow.",
    icon: KanbanSquare,
    accent: "from-violet-600 to-blue-600",
    metrics: [
      { label: "Openings",    value: "Live", delta: "Track requisitions",   icon: Target },
      { label: "Pipeline",    value: "Live", delta: "Stage movement",       icon: KanbanSquare },
      { label: "Interviews",  value: "Live", delta: "Next hiring actions",  icon: CalendarDays },
      { label: "Conversion",  value: "Live", delta: "Candidate → employee", icon: ArrowUpRight },
    ],
    views: [
      { label: "Pipeline" },
      { label: "Openings",    href: "/recruitment?view=openings" },
      { label: "Interviews",  href: "/recruitment?view=interviews" },
      { label: "Offers",      href: "/recruitment?view=offers" },
    ],
    primary: "New opening",
    primaryAction: "new-opening",
  },
  "/onboarding": {
    eyebrow: "New hire experience",
    title: "Onboarding command center",
    description: "Track every new hire through documents, verification and completion milestones.",
    icon: ListChecks,
    accent: "from-emerald-600 to-teal-600",
    metrics: [
      { label: "In progress",  value: "Live", delta: "New hires",       icon: UserCheck },
      { label: "Completion",   value: "Live", delta: "Checklist progress", icon: CheckCircle2 },
      { label: "Documents",    value: "Live", delta: "Pending items",   icon: FileCheck2 },
      { label: "Verification", value: "Live", delta: "BGV readiness",   icon: ShieldCheck },
    ],
    views: [
      { label: "Overview" },
      { label: "Checklists",    href: "/onboarding?view=checklists" },
      { label: "Documents",     href: "/onboarding?view=documents" },
      { label: "Verification",  href: "/onboarding?view=verification" },
    ],
    primary: "Review pending",
    primaryAction: "review-pending",
  },
  "/attendance": {
    eyebrow: "Workforce time",
    title: "Attendance command center",
    description: "See daily attendance, exceptions, trends and team-level time patterns in one workspace.",
    icon: Clock3,
    accent: "from-cyan-600 to-blue-600",
    metrics: [
      { label: "Today",       value: "Live", delta: "Present / absent",     icon: Clock3 },
      { label: "Exceptions",  value: "Live", delta: "Requires attention",   icon: Filter },
      { label: "Calendar",    value: "Live", delta: "Daily view",           icon: CalendarDays },
      { label: "Trends",      value: "Live", delta: "Team patterns",        icon: BarChart3 },
    ],
    views: [
      { label: "Today" },
      { label: "Calendar",    href: "/attendance?view=calendar" },
      { label: "Trends",      href: "/attendance?view=trends" },
      { label: "Exceptions",  href: "/attendance?view=exceptions" },
    ],
    primary: "Review exceptions",
    primaryAction: "review-exceptions",
  },
  "/leaves": {
    eyebrow: "Time off management",
    title: "Employee leave workspace",
    description: "Review employee-specific balances, applications, approvals and leave history without mixing policy administration.",
    icon: CalendarDays,
    accent: "from-amber-500 to-orange-600",
    metrics: [
      { label: "Balances",   value: "Employee", delta: "Applied types only",  icon: CalendarDays },
      { label: "Requests",   value: "Live",     delta: "Pending / approved",  icon: ListChecks },
      { label: "Approvals",  value: "Live",     delta: "HR workflow",         icon: CheckCircle2 },
      { label: "History",    value: "Live",     delta: "Request timeline",    icon: Clock3 },
    ],
    views: [
      { label: "Employee view" },
      { label: "Requests",  href: "/leaves?view=requests" },
      { label: "Approvals", href: "/leaves?view=approvals" },
      { label: "History",   href: "/leaves?view=history" },
    ],
    primary: "Apply leave",
    primaryAction: "apply-leave",
  },
  "/leave-policies": {
    eyebrow: "Policy administration",
    title: "Leave policy command center",
    description: "Configure organization-wide leave rules including gender eligibility, quota, carry-forward and controls.",
    icon: ClipboardCheck,
    accent: "from-fuchsia-600 to-purple-600",
    metrics: [
      { label: "Policies",      value: "18",           delta: "Configured rules",    icon: ClipboardCheck },
      { label: "Eligibility",   value: "Gender-aware", delta: "Backend enforced",    icon: UserCheck },
      { label: "Carry-forward", value: "Policy",       delta: "Per leave type",      icon: GitBranch },
      { label: "Controls",      value: "Policy",       delta: "Notice / documents",  icon: ShieldCheck },
    ],
    views: [
      { label: "All policies" },
      { label: "Eligibility",    href: "/leave-policies?view=eligibility" },
      { label: "Carry-forward",  href: "/leave-policies?view=carry-forward" },
      { label: "Controls",       href: "/leave-policies?view=controls" },
    ],
    primary: "Add leave policy",
    primaryAction: "add-leave-policy",
  },
  "/payroll": {
    eyebrow: "Compensation operations",
    title: "Payroll command center",
    description: "Navigate payroll runs, salary composition, deductions and payment readiness from one control surface.",
    icon: WalletCards,
    accent: "from-blue-700 to-cyan-600",
    metrics: [
      { label: "Payroll run", value: "Live", delta: "Current cycle",       icon: WalletCards },
      { label: "Salary",      value: "Live", delta: "Basic + allowances",  icon: CircleDollarSign },
      { label: "Deductions",  value: "Live", delta: "Payroll adjustments", icon: BarChart3 },
      { label: "Payments",    value: "Live", delta: "Processing status",   icon: CheckCircle2 },
    ],
    views: [
      { label: "Payroll run" },
      { label: "Employees",  href: "/payroll?view=employees" },
      { label: "Deductions", href: "/payroll?view=deductions" },
      { label: "History",    href: "/payroll?view=history" },
    ],
    primary: "Start payroll",
    primaryAction: "start-payroll",
  },
  "/performance": {
    eyebrow: "Performance intelligence",
    title: "Performance command center",
    description: "Turn review cycles into an actionable view of ratings, goals, feedback and team performance.",
    icon: Target,
    accent: "from-indigo-600 to-violet-600",
    metrics: [
      { label: "Review cycle", value: "Live", delta: "Current cycle",      icon: Target },
      { label: "Ratings",      value: "Live", delta: "Distribution",       icon: BarChart3 },
      { label: "Goals",        value: "Live", delta: "Progress tracking",  icon: CheckCircle2 },
      { label: "Reviews",      value: "Live", delta: "Completion status",  icon: ListChecks },
    ],
    views: [
      { label: "Overview" },
      { label: "Reviews",        href: "/performance?view=reviews" },
      { label: "Goals",          href: "/performance?view=goals" },
      { label: "Team analytics", href: "/performance?view=team-analytics" },
    ],
    primary: "Start review",
    primaryAction: "start-review",
  },
  "/documents": {
    eyebrow: "HR document operations",
    title: "Document command center",
    description: "Search, classify, verify and manage employee documents with a repository-first workflow.",
    icon: FileCheck2,
    accent: "from-slate-700 to-blue-700",
    metrics: [
      { label: "Repository",   value: "Live", delta: "Searchable files",   icon: FileCheck2 },
      { label: "Verification", value: "Live", delta: "Pending / verified", icon: ShieldCheck },
      { label: "Categories",   value: "Live", delta: "Document types",     icon: ClipboardCheck },
      { label: "Expiry",       value: "Live", delta: "Compliance watch",   icon: CalendarDays },
    ],
    views: [
      { label: "All documents" },
      { label: "Pending",   href: "/documents?view=pending" },
      { label: "Verified",  href: "/documents?view=verified" },
      { label: "Expiring",  href: "/documents?view=expiring" },
    ],
    primary: "Upload document",
    primaryAction: "upload-document",
  },
  "/teams": {
    eyebrow: "Organization design",
    title: "Teams command center",
    description: "Explore reporting structures, departments, team composition and organizational coverage.",
    icon: Network,
    accent: "from-sky-600 to-indigo-600",
    metrics: [
      { label: "Teams",       value: "Live", delta: "Organization map",  icon: Network },
      { label: "Departments", value: "Live", delta: "Coverage",          icon: Users },
      { label: "Managers",    value: "Live", delta: "Reporting lines",   icon: UserCheck },
      { label: "Capacity",    value: "Live", delta: "Team composition",  icon: BarChart3 },
    ],
    views: [
      { label: "Organization" },
      { label: "Teams",       href: "/teams?view=teams" },
      { label: "Departments", href: "/teams?view=departments" },
      { label: "Managers",    href: "/teams?view=managers" },
    ],
    primary: "Create team",
    primaryAction: "create-team",
  },
  "/insurance": {
    eyebrow: "Employee benefits",
    title: "Insurance command center",
    description: "Manage employee coverage, dependents, premiums and policy validity from one benefits workspace.",
    icon: HeartPulse,
    accent: "from-rose-600 to-pink-600",
    metrics: [
      { label: "Coverage",   value: "Live", delta: "Employee policies",   icon: HeartPulse },
      { label: "Dependents", value: "Live", delta: "Covered members",     icon: Users },
      { label: "Premiums",   value: "Live", delta: "Contribution split",  icon: CircleDollarSign },
      { label: "Validity",   value: "Live", delta: "Policy dates",        icon: CalendarDays },
    ],
    views: [
      { label: "Coverage" },
      { label: "Dependents", href: "/insurance?view=dependents" },
      { label: "Premiums",   href: "/insurance?view=premiums" },
      { label: "Validity",   href: "/insurance?view=validity" },
    ],
    primary: "Review coverage",
    primaryAction: "review-coverage",
  },
  "/background-check": {
    eyebrow: "Risk & compliance",
    title: "Background verification center",
    description: "Track verification progress, exceptions and clearance status across the employee lifecycle.",
    icon: ShieldCheck,
    accent: "from-red-600 to-orange-600",
    metrics: [
      { label: "Checks",     value: "Live", delta: "Verification queue", icon: ShieldCheck },
      { label: "Pending",    value: "Live", delta: "Needs review",       icon: Clock3 },
      { label: "Cleared",    value: "Live", delta: "Completed checks",   icon: CheckCircle2 },
      { label: "Exceptions", value: "Live", delta: "Risk review",        icon: Filter },
    ],
    views: [
      { label: "Verification queue" },
      { label: "Pending",    href: "/background-check?view=pending" },
      { label: "Cleared",    href: "/background-check?view=cleared" },
      { label: "Exceptions", href: "/background-check?view=exceptions" },
    ],
    primary: "Review queue",
    primaryAction: "review-queue",
  },
  "/policies": {
    eyebrow: "Governance",
    title: "Policy command center",
    description: "Maintain a searchable policy library with acknowledgement and governance visibility.",
    icon: ClipboardCheck,
    accent: "from-slate-700 to-slate-900",
    metrics: [
      { label: "Library",          value: "Live",      delta: "Published policies",  icon: ClipboardCheck },
      { label: "Acknowledgements", value: "Live",      delta: "Employee actions",    icon: CheckCircle2 },
      { label: "Updates",          value: "Live",      delta: "Recent changes",      icon: ArrowUpRight },
      { label: "Access",           value: "Controlled",delta: "Role-aware",          icon: LockKeyhole },
    ],
    views: [
      { label: "Policy library" },
      { label: "Acknowledgements", href: "/policies?view=acknowledgements" },
      { label: "Updates",          href: "/policies?view=updates" },
      { label: "Governance",       href: "/policies?view=governance" },
    ],
    primary: "Create policy",
    primaryAction: "create-policy",
  },
  "/settings": {
    eyebrow: "Administration",
    title: "Administration command center",
    description: "Manage account security and organization configuration through a structured settings workspace.",
    icon: LockKeyhole,
    accent: "from-gray-800 to-blue-900",
    metrics: [
      { label: "Account",  value: "Ready",      delta: "Profile settings", icon: UserCheck },
      { label: "Security", value: "Ready",      delta: "Password / MFA",   icon: LockKeyhole },
      { label: "Access",   value: "Role-based", delta: "Permissions",      icon: ShieldCheck },
      { label: "System",   value: "Ready",      delta: "Administration",   icon: Network },
    ],
    views: [
      { label: "Account" },
      { label: "Security", href: "/settings?view=security" },
      { label: "Access",   href: "/settings?view=access" },
      { label: "System",   href: "/settings?view=system" },
    ],
    primary: "Security settings",
    primaryAction: "security-settings",
  },
};

function Metric({ item }: { item: ModuleConfig["metrics"][number] }) {
  const Icon = item.icon;
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</span>
        <Icon size={14} className="text-slate-300 group-hover:text-blue-500" />
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className="text-lg font-bold tracking-tight text-slate-900">{item.value}</span>
        <span className="text-[9px] font-medium text-emerald-600">{item.delta}</span>
      </div>
    </div>
  );
}

export function ModuleCommandCenter() {
  const pathname = usePathname();
  const router = useRouter();

  const key = Object.keys(CONFIG).find(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (!key) return null;

  const config = CONFIG[key];
  const Icon = config.icon;

  /** Fire a custom event so individual pages can open their add/action modal */
  function handlePrimaryAction() {
    window.dispatchEvent(
      new CustomEvent("hrm:action", { detail: { action: config.primaryAction } })
    );
  }

  /** Determine which tab is currently active based on pathname + search params */
  function isActiveView(view: ViewConfig, index: number): boolean {
    if (typeof window === "undefined") return index === 0;
    const sp = new URLSearchParams(window.location.search);
    const currentView = sp.get("view");
    if (view.href) {
      try {
        const u = new URL(view.href, window.location.origin);
        const vParam = u.searchParams.get("view");
        // Special case: full path navigation (no view param) — match exact pathname
        if (!vParam) return pathname === u.pathname && !currentView;
        return vParam === currentView;
      } catch {
        return false;
      }
    }
    // First tab (no href) is active when no view param is set
    return !currentView && pathname === key;
  }

  return (
    <section className="border-b border-slate-200/80 bg-[#f7f9fd] px-5 pb-4 pt-4 md:px-7">
      {/* Hero banner */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${config.accent} p-5 text-white shadow-xl shadow-slate-300/20`}
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute bottom-[-80px] left-[35%] h-48 w-48 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/65">
              <Sparkles size={12} /> {config.eyebrow}
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
                <Icon size={19} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight md:text-2xl">{config.title}</h2>
                <p className="mt-1 text-xs leading-5 text-white/70">{config.description}</p>
              </div>
            </div>
          </div>

          {/* Primary CTA — fires hrm:action event */}
          <button
            type="button"
            onClick={handlePrimaryAction}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-800 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            {config.primary}
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {config.metrics.map((metric) => (
          <Metric key={metric.label} item={metric} />
        ))}
      </div>

      {/* Search bar + view tabs */}
      <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <span className="truncate text-[11px] text-slate-400">
            Search within {config.title.replace(" command center", "").replace(" center", "").toLowerCase()}…
          </span>
          <kbd className="ml-auto hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-400 md:block">
            ⌘ K
          </kbd>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto">
          {config.views.map((view, index) => {
            const active = isActiveView(view, index);
            return (
              <button
                key={view.label}
                type="button"
                onClick={() => {
                  if (view.href) {
                    router.push(view.href);
                  } else {
                    // First tab — go to the base route, strip any view param
                    router.push(key);
                  }
                }}
                className={
                  active
                    ? "whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-semibold text-white"
                    : "whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                }
              >
                {view.label}
              </button>
            );
          })}

          <button
            type="button"
            className="ml-auto hidden shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-500 hover:bg-slate-50 md:flex"
          >
            <Filter size={12} /> Filters
          </button>
        </div>
      </div>
    </section>
  );
}
