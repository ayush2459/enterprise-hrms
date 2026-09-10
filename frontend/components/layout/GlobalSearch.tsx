"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  UserPlus,
  UserCheck,
  WalletCards,
  TrendingUp,
  Network,
  HeartPulse,
  ShieldCheck,
  ClipboardCheck,
  BriefcaseBusiness,
} from "lucide-react";
import { employeeService } from "@/services/employee.service";
import type { EmployeePublic } from "@/types";


const SMART_WORKSPACES = [
  { label: "Employee Analytics", keywords: "employee analytics workforce insights", href: "/employees?view=analytics", icon: TrendingUp },
  { label: "Employee Departments", keywords: "employee department departments workforce", href: "/employees?view=departments", icon: Network },
  { label: "Former Employees", keywords: "former employees ex employees previous staff", href: "/employees?view=former-employees", icon: Users },

  { label: "Recruitment Pipeline", keywords: "recruitment pipeline candidates hiring", href: "/recruitment?view=pipeline", icon: UserPlus },
  { label: "Recruitment Openings", keywords: "recruitment openings jobs requisitions", href: "/recruitment?view=openings", icon: BriefcaseBusiness },
  { label: "Recruitment Interviews", keywords: "recruitment interviews interview candidates", href: "/recruitment?view=interviews", icon: UserCheck },
  { label: "Recruitment Offers", keywords: "recruitment offers offer candidates", href: "/recruitment?view=offers", icon: FileText },

  { label: "Onboarding Overview", keywords: "onboarding overview joining new hire", href: "/onboarding?view=overview", icon: UserCheck },
  { label: "Onboarding Checklists", keywords: "onboarding checklist checklists tasks", href: "/onboarding?view=checklists", icon: ClipboardCheck },
  { label: "Onboarding Documents", keywords: "onboarding documents paperwork", href: "/onboarding?view=documents", icon: FileText },
  { label: "Onboarding Verification", keywords: "onboarding verification checks", href: "/onboarding?view=verification", icon: ShieldCheck },

  { label: "Attendance Today", keywords: "attendance today present absent", href: "/attendance?view=today", icon: CalendarDays },
  { label: "Attendance Calendar", keywords: "attendance calendar dates", href: "/attendance?view=calendar", icon: CalendarDays },
  { label: "Attendance Trends", keywords: "attendance trends analytics", href: "/attendance?view=trends", icon: TrendingUp },
  { label: "Attendance Exceptions", keywords: "attendance exceptions issues", href: "/attendance?view=exceptions", icon: ShieldCheck },

  { label: "Leave Requests", keywords: "leave requests time off", href: "/leaves?view=requests", icon: CalendarDays },
  { label: "Leave Approvals", keywords: "leave approvals approve pending", href: "/leaves?view=approvals", icon: UserCheck },
  { label: "Leave History", keywords: "leave history previous requests", href: "/leaves?view=history", icon: FileText },

  { label: "Payroll Run", keywords: "payroll run salary processing", href: "/payroll?view=payroll-run", icon: WalletCards },
  { label: "Payroll Employees", keywords: "payroll employees salary compensation", href: "/payroll?view=employees", icon: Users },
  { label: "Payroll Deductions", keywords: "payroll deductions adjustments", href: "/payroll?view=deductions", icon: WalletCards },
  { label: "Payroll History", keywords: "payroll history previous runs", href: "/payroll?view=history", icon: FileText },

  { label: "Performance Reviews", keywords: "performance reviews appraisal", href: "/performance?view=reviews", icon: TrendingUp },
  { label: "Performance Goals", keywords: "performance goals objectives", href: "/performance?view=goals", icon: TrendingUp },
  { label: "Performance Team Analytics", keywords: "performance team analytics", href: "/performance?view=team-analytics", icon: Network },

  { label: "All Documents", keywords: "all documents document repository", href: "/documents?view=all-documents", icon: FileText },
  { label: "Pending Documents", keywords: "pending documents verification", href: "/documents?view=pending", icon: FileText },
  { label: "Verified Documents", keywords: "verified documents", href: "/documents?view=verified", icon: ShieldCheck },
  { label: "Expiring Documents", keywords: "expiring documents expiry", href: "/documents?view=expiring", icon: CalendarDays },

  { label: "Teams Organization", keywords: "teams organization structure", href: "/teams?view=organization", icon: Network },
  { label: "Teams Departments", keywords: "teams departments", href: "/teams?view=departments", icon: Network },
  { label: "Team Managers", keywords: "teams managers reporting", href: "/teams?view=managers", icon: Users },

  { label: "Insurance Coverage", keywords: "insurance coverage benefits", href: "/insurance?view=coverage", icon: HeartPulse },
  { label: "Insurance Dependents", keywords: "insurance dependents", href: "/insurance?view=dependents", icon: Users },
  { label: "Insurance Premiums", keywords: "insurance premiums cost", href: "/insurance?view=premiums", icon: WalletCards },
  { label: "Insurance Validity", keywords: "insurance validity expiry", href: "/insurance?view=validity", icon: CalendarDays },

  { label: "Background Verification Queue", keywords: "background verification queue checks", href: "/background-check?view=verification-queue", icon: ShieldCheck },
  { label: "Background Pending", keywords: "background pending checks", href: "/background-check?view=pending", icon: ShieldCheck },
  { label: "Background Cleared", keywords: "background cleared checks", href: "/background-check?view=cleared", icon: UserCheck },
  { label: "Background Exceptions", keywords: "background exceptions issues", href: "/background-check?view=exceptions", icon: ShieldCheck },

  { label: "Policy Library", keywords: "policy library policies", href: "/policies?view=policy-library", icon: ClipboardCheck },
  { label: "Policy Acknowledgements", keywords: "policy acknowledgements employees", href: "/policies?view=acknowledgements", icon: UserCheck },
  { label: "Policy Updates", keywords: "policy updates changes", href: "/policies?view=updates", icon: FileText },
  { label: "Policy Governance", keywords: "policy governance controls", href: "/policies?view=governance", icon: ShieldCheck },

  { label: "Leave Policy Eligibility", keywords: "leave policy eligibility rules", href: "/leave-policies?view=eligibility", icon: ClipboardCheck },
  { label: "Leave Policy Carry Forward", keywords: "leave policy carry forward", href: "/leave-policies?view=carry-forward", icon: CalendarDays },
  { label: "Leave Policy Controls", keywords: "leave policy controls", href: "/leave-policies?view=controls", icon: Settings },
];

const PAGE_RESULTS = [
  { label: "Dashboard", keywords: "home overview analytics", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", keywords: "employee employees directory people staff", href: "/employees", icon: Users },
  { label: "Recruitment", keywords: "recruitment recruit hiring jobs candidates applicants", href: "/recruitment", icon: UserPlus },
  { label: "Onboarding", keywords: "onboarding joining join new hire checklist", href: "/onboarding", icon: UserCheck },
  { label: "Attendance", keywords: "attendance time present absent calendar", href: "/attendance", icon: CalendarDays },
  { label: "Leaves", keywords: "leave leaves request requests balance time off vacation", href: "/leaves", icon: CalendarDays },
  { label: "Payroll", keywords: "payroll salary payslip compensation wages payment", href: "/payroll", icon: WalletCards },
  { label: "Performance", keywords: "performance reviews review goals rating appraisal", href: "/performance", icon: TrendingUp },
  { label: "Documents", keywords: "documents document files repository contracts records", href: "/documents", icon: FileText },
  { label: "Teams", keywords: "teams team organization departments structure", href: "/teams", icon: Network },
  { label: "Insurance", keywords: "insurance benefits medical coverage health", href: "/insurance", icon: HeartPulse },
  { label: "Leave Policies", keywords: "leave policies policy quota carry forward eligibility", href: "/leave-policies", icon: CalendarDays },
  { label: "Background Checks", keywords: "background check checks bgv verification screening", href: "/background-check", icon: ShieldCheck },
  { label: "Policies", keywords: "policies policy company handbook rules", href: "/policies", icon: ClipboardCheck },
  { label: "Settings", keywords: "settings setting configuration organization preferences", href: "/settings", icon: Settings },
];

interface GlobalSearchProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

function matchesQuery(value: string, query: string) {
  const tokens = query.split(/\s+/).filter(Boolean);
  const haystack = value.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

export function GlobalSearch({ mobile = false, onNavigate }: GlobalSearchProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [employees, setEmployees] = useState<EmployeePublic[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadEmployees = async () => {
      try {
        const data = await employeeService.list(0, 100);
        if (mounted) setEmployees(data);
      } catch {
        if (mounted) setEmployees([]);
      }
    };

    loadEmployees();

    const refreshOnFocus = () => loadEmployees();
    window.addEventListener("focus", refreshOnFocus);

    const interval = window.setInterval(loadEmployees, 60000);

    return () => {
      mounted = false;
      window.removeEventListener("focus", refreshOnFocus);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const focusSearch = () => {
      inputRef.current?.focus();
      setOpen(true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        focusSearch();
      }

      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("hrms:focus-global-search", focusSearch);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("hrms:focus-global-search", focusSearch);
    };
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const normalized = query.trim().toLowerCase();

  const pageResults = useMemo(() => {
    if (!normalized) return PAGE_RESULTS.slice(0, 6);
    return PAGE_RESULTS
      .filter((page) => matchesQuery(`${page.label} ${page.keywords}`, normalized))
      .slice(0, 6);
  }, [normalized]);

  const workspaceResults = useMemo(() => {
    if (!normalized) return [];

    return SMART_WORKSPACES
      .filter((workspace) =>
        matchesQuery(
          `${workspace.label} ${workspace.keywords}`,
          normalized
        )
      )
      .slice(0, 6);
  }, [normalized]);

  const employeeResults = useMemo(() => {
    if (!normalized) return [];
    return employees
      .filter((employee) =>
        matchesQuery(
          [
            employee.full_name,
            employee.department,
            employee.designation,
            employee.gender,
            employee.status,
          ]
            .filter(Boolean)
            .join(" "),
          normalized
        )
      )
      .slice(0, 5);
  }, [employees, normalized]);

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(href);
  };

  const handleSubmit = () => {
    if (workspaceResults.length > 0) {
      navigate(workspaceResults[0].href);
      return;
    }

    if (employeeResults.length > 0 && pageResults.length === 0) {
      navigate(`/employees/${employeeResults[0].id}`);
      return;
    }

    if (pageResults.length > 0) {
      navigate(pageResults[0].href);
      return;
    }

    if (employeeResults.length > 0) {
      navigate(`/employees/${employeeResults[0].id}`);
    }
  };

  return (
    <div ref={wrapperRef} className={mobile ? "relative w-full" : "relative hidden w-[360px] md:block"}>
      <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
        <Search size={15} className="shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit();
            }
          }}
          aria-label="Smart search"
          placeholder="Search people, pages, or actions..."
          className="w-full border-0 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
        />
        {!mobile && (
          <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-400">⌘ K</kbd>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-12 z-[70] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,.16)]">
          {!normalized ? (
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Quick navigation</p>
              <p className="mt-1 text-xs text-slate-500">Search a module, employee, department, or action.</p>
            </div>
          ) : (
            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="text-[11px] font-medium text-slate-500">Results for <span className="font-semibold text-slate-800">{query}</span></p>
            </div>
          )}

          <div className="max-h-[420px] overflow-y-auto p-2">
            {workspaceResults.length > 0 && (
              <div>
                <p className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Workspaces
                </p>

                {workspaceResults.map((workspace) => {
                  const Icon = workspace.icon;

                  return (
                    <button
                      key={workspace.href}
                      type="button"
                      onClick={() => navigate(workspace.href)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-white">
                        <Icon size={15} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-slate-800">
                          {workspace.label}
                        </span>
                        <span className="block truncate text-[10px] text-slate-400">
                          {workspace.keywords}
                        </span>
                      </span>

                      <ArrowRight
                        size={14}
                        className="text-slate-300 group-hover:text-blue-500"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {pageResults.length > 0 && (
              <div>
                <p className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Pages</p>
                {pageResults.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button key={page.href} type="button" onClick={() => navigate(page.href)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600"><Icon size={15} /></span>
                      <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800">{page.label}</span><span className="block truncate text-[10px] text-slate-400">{page.keywords}</span></span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                    </button>
                  );
                })}
              </div>
            )}

            {employeeResults.length > 0 && (
              <div className="mt-2 border-t border-slate-100 pt-2">
                <p className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Employees</p>
                {employeeResults.map((employee) => (
                  <button key={employee.id} type="button" onClick={() => navigate(`/employees/${employee.id}`)} className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">{employee.full_name.slice(0, 2).toUpperCase()}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-slate-800">{employee.full_name}</span>
                      <span className="block truncate text-[10px] text-slate-400">{[employee.designation, employee.department].filter(Boolean).join(" · ") || "Employee profile"}</span>
                    </span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            )}

            {normalized && pageResults.length === 0 && workspaceResults.length === 0 && employeeResults.length === 0 && (
              <div className="px-4 py-8 text-center">
                <BriefcaseBusiness size={22} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No matching page or employee</p>
                <p className="mt-1 text-[10px] text-slate-400">Try a module name, employee name, department, or keyword.</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[9px] text-slate-400">Enter to open the best result · Esc to close · ⌘ K to focus</div>
        </div>
      )}
    </div>
  );
}
