"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, Users, FileText, ShieldCheck, Settings, Network, Briefcase, ClipboardCheck, UserCheck, HeartPulse, Wallet, TrendingUp, CalendarCheck, CalendarDays } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/recruitment", label: "Recruitment", icon: Briefcase },
  { href: "/onboarding", label: "Onboarding", icon: ClipboardCheck },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/background-check", label: "Background Check", icon: UserCheck },
  { href: "/insurance", label: "Insurance", icon: HeartPulse },
  { href: "/teams", label: "Teams", icon: Network },
  { href: "/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/leaves", label: "Leaves", icon: CalendarDays },
  { href: "/payroll", label: "Payroll", icon: Wallet },
  { href: "/performance", label: "Performance", icon: TrendingUp },
  { href: "/policies", label: "Policies", icon: ShieldCheck },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-brand-dark text-white">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-light font-display text-sm font-bold shadow-lift">
          H
        </div>
        <span className="font-display text-lg font-semibold tracking-tight">HRHub</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                active ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
            >
              <span
                className={clsx(
                  "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-light transition-all duration-150",
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                )}
              />
              <Icon size={17} className={clsx("transition-colors", active && "text-brand-light")} />
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
