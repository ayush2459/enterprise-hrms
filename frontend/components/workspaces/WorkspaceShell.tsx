 "use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bell, ChevronRight, LogOut, Menu, Settings } from "lucide-react";
import Cookies from "js-cookie";
import { Suspense, type ReactNode } from "react";

export type WorkspaceRole = "employee" | "manager";

const navByRole = {
  employee: [
    ["My Workspace", "/my-workspace"],
    ["Attendance", "/my-workspace?tab=attendance"],
    ["Leaves", "/my-workspace?tab=leaves"],
    ["Payroll", "/my-workspace?tab=payroll"],
    ["Documents", "/my-workspace?tab=documents"],
    ["Profile", "/my-workspace?tab=profile"],
    ["Settings", "/my-workspace?tab=settings"],
  ],
  manager: [
    ["Overview", "/manager"],
    ["My Team", "/manager?tab=team"],
    ["Leave Approvals", "/manager?tab=approvals"],
    ["Attendance", "/manager?tab=attendance"],
    ["Performance", "/manager?tab=performance"],
    ["Profile", "/manager?tab=profile"],
    ["Settings", "/manager?tab=settings"],
  ],
} as const;

function WorkspaceShellInner({
  role,
  title,
  subtitle,
  name,
  children,
}: {
  role: WorkspaceRole;
  title: string;
  subtitle: string;
  name: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const logout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
    } catch {}
    window.location.href = "/login";
  };

  const items = navByRole[role];
  const workspaceLabel = role === "manager" ? "MANAGER WORKSPACE" : "EMPLOYEE SELF-SERVICE";
  const initial = name?.trim()?.[0]?.toUpperCase() || (role === "manager" ? "M" : "E");

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-[#0b1f4b] text-white lg:flex">
        <div className="flex h-[72px] items-center px-5">
          <Link href={role === "manager" ? "/manager" : "/my-workspace"} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-blue-600 shadow-lg">
              HR
            </div>
            <div>
              <div className="text-[17px] font-bold tracking-tight">HRHub</div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-blue-200/65">
                Enterprise HRMS
              </div>
            </div>
          </Link>
        </div>

        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold">{name || "Workspace User"}</div>
              <div className="truncate text-[10px] text-blue-200/60">{role === "manager" ? "Manager" : "Employee"}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-5">
          <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-200/45">
            {workspaceLabel}
          </p>
          <div className="space-y-1">
            {items.map(([label, href]) => {
              const targetPath = href.split("?")[0];
              const targetTab = href.includes("?") ? new URLSearchParams(href.split("?")[1]).get("tab") : null;
              const active = pathname === targetPath && (targetTab ? searchParams.get("tab") === targetTab : !searchParams.get("tab"));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition ${
                    active ? "bg-blue-600 text-white shadow-sm" : "text-blue-100/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={13} />}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          <button onClick={() => router.push(role === "manager" ? "/manager" : "/my-workspace")} className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-blue-100/75 hover:bg-white/10 hover:text-white">
            <Settings size={16} />
            Workspace settings
          </button>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-blue-100/75 hover:bg-white/10 hover:text-white">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 flex h-[64px] items-center border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-7">
          <button className="mr-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Menu">
            <Menu size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[17px] font-bold tracking-tight">{title}</h1>
            <p className="truncate text-[10px] text-slate-400">{subtitle}</p>
          </div>
          <button className="relative mr-2 rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
          </button>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">{initial}</div>
            <div className="hidden sm:block">
              <div className="text-[11px] font-semibold">{name || "Workspace User"}</div>
              <div className="text-[9px] text-slate-400">{role === "manager" ? "Manager" : "Employee"}</div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}

export function WorkspaceShell(props: {
  role: WorkspaceRole;
  title: string;
  subtitle: string;
  name: string;
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center text-sm text-slate-500">
          Loading workspace…
        </div>
      }
    >
      <WorkspaceShellInner {...props} />
    </Suspense>
  );
}
