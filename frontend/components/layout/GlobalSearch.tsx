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

const PAGE_RESULTS = [
  { label: "Dashboard", keywords: "home overview analytics", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", keywords: "employee directory people staff", href: "/employees", icon: Users },
  { label: "Recruitment", keywords: "hiring jobs candidates applicants", href: "/recruitment", icon: UserPlus },
  { label: "Onboarding", keywords: "joining new hire checklist", href: "/onboarding", icon: UserCheck },
  { label: "Attendance", keywords: "time present absent calendar", href: "/attendance", icon: CalendarDays },
  { label: "Leaves", keywords: "leave requests balance time off", href: "/leaves", icon: CalendarDays },
  { label: "Payroll", keywords: "salary payslip compensation payroll", href: "/payroll", icon: WalletCards },
  { label: "Performance", keywords: "reviews goals rating appraisal", href: "/performance", icon: TrendingUp },
  { label: "Documents", keywords: "files repository contracts records", href: "/documents", icon: FileText },
  { label: "Teams", keywords: "organization departments structure", href: "/teams", icon: Network },
  { label: "Insurance", keywords: "benefits medical coverage", href: "/insurance", icon: HeartPulse },
  { label: "Leave Policies", keywords: "leave policy quota carry forward eligibility", href: "/leave-policies", icon: CalendarDays },
  { label: "Background Checks", keywords: "bgv verification screening", href: "/background-check", icon: ShieldCheck },
  { label: "Policies", keywords: "company policies handbook rules", href: "/policies", icon: ClipboardCheck },
  { label: "Settings", keywords: "configuration organization preferences", href: "/settings", icon: Settings },
];

interface GlobalSearchProps {
  mobile?: boolean;
  onNavigate?: () => void;
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
    employeeService
      .list(0, 100)
      .then((data) => {
        if (mounted) setEmployees(data);
      })
      .catch(() => {
        if (mounted) setEmployees([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const normalized = query.trim().toLowerCase();

  const pageResults = useMemo(() => {
    if (!normalized) return PAGE_RESULTS.slice(0, 6);

    return PAGE_RESULTS.filter((page) =>
      `${page.label} ${page.keywords}`.toLowerCase().includes(normalized)
    ).slice(0, 6);
  }, [normalized]);

  const employeeResults = useMemo(() => {
    if (!normalized) return [];

    return employees
      .filter((employee) => {
        const haystack = [
          employee.full_name,
          employee.email,
          employee.department,
          employee.designation,
          employee.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(normalized);
      })
      .slice(0, 5);
  }, [employees, normalized]);

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(href);
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
              const firstPage = pageResults[0];
              const firstEmployee = employeeResults[0];

              if (firstPage) navigate(firstPage.href);
              else if (firstEmployee) navigate(`/employees/${firstEmployee.id}`);
            }
          }}
          aria-label="Smart search"
          placeholder="Search people, pages, or actions..."
          className="w-full border-0 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
        />
        {!mobile && (
          <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
            ⌘ K
          </kbd>
        )}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-12 z-[70] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,.16)]">
          {!normalized ? (
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Quick navigation</p>
              <p className="mt-1 text-xs text-slate-500">Jump directly to any HR module or search an employee.</p>
            </div>
          ) : (
            <div className="border-b border-slate-100 px-4 py-2.5">
              <p className="text-[11px] font-medium text-slate-500">Results for <span className="font-semibold text-slate-800">{query}</span></p>
            </div>
          )}

          <div className="max-h-[420px] overflow-y-auto p-2">
            {pageResults.length > 0 && (
              <div>
                <p className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">Pages</p>
                {pageResults.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.href}
                      type="button"
                      onClick={() => navigate(page.href)}
                      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-600">
                        <Icon size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-semibold text-slate-800">{page.label}</span>
                        <span className="block truncate text-[10px] text-slate-400">{page.keywords}</span>
                      </span>
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
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => navigate(`/employees/${employee.id}`)}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-blue-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                      {employee.full_name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-slate-800">{employee.full_name}</span>
                      <span className="block truncate text-[10px] text-slate-400">
                        {[employee.designation, employee.department].filter(Boolean).join(" · ") || employee.email || "Employee profile"}
                      </span>
                    </span>
                    <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500" />
                  </button>
                ))}
              </div>
            )}

            {normalized && pageResults.length === 0 && employeeResults.length === 0 && (
              <div className="px-4 py-8 text-center">
                <BriefcaseBusiness size={22} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No matching page or employee</p>
                <p className="mt-1 text-[10px] text-slate-400">Try a module name, employee name, department, or keyword.</p>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-[9px] text-slate-400">
            Enter to open the first result · Esc to close · ⌘ K to focus
          </div>
        </div>
      )}
    </div>
  );
}
