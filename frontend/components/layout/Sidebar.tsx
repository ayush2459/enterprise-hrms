"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  UserCheck,
  CalendarDays,
  Clock3,
  WalletCards,
  FileText,
  ShieldCheck,
  BriefcaseBusiness,
  HeartPulse,
  TrendingUp,
  Network,
  Settings,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
} from "lucide-react";

const primary = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    label: "Recruitment",
    href: "/recruitment",
    icon: UserPlus,
  },
  {
    label: "Onboarding",
    href: "/onboarding",
    icon: UserCheck,
  },
];

const people = [
  {
    label: "Attendance",
    href: "/attendance",
    icon: Clock3,
  },
  {
    label: "Leaves",
    href: "/leaves",
    icon: CalendarDays,
  },
  {
    label: "Payroll",
    href: "/payroll",
    icon: WalletCards,
  },
  {
    label: "Performance",
    href: "/performance",
    icon: TrendingUp,
  },
];

const manage = [
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Teams",
    href: "/teams",
    icon: Network,
  },
  {
    label: "Insurance",
    href: "/insurance",
    icon: HeartPulse,
  },
  {
    label: "Background Checks",
    href: "/background-check",
    icon: ShieldCheck,
  },
  {
    label: "Policies",
    href: "/policies",
    icon: ClipboardCheck,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const renderItem = (
    item: {
      label: string;
      href: string;
      icon: any;
    }
  ) => {
    const Icon = item.icon;

    const active =
      pathname === item.href ||
      pathname.startsWith(item.href + "/");

    return (
      <Link
        key={item.href}
        href={item.href}
        className={[
          "group flex items-center gap-3 rounded-lg px-3 py-2.5",
          "text-[13px] font-medium transition-all duration-150",
          active
            ? "bg-white/15 text-white shadow-sm"
            : "text-blue-100/75 hover:bg-white/10 hover:text-white",
        ].join(" ")}
      >
        <Icon
          size={17}
          strokeWidth={active ? 2.2 : 1.8}
          className={
            active
              ? "text-white"
              : "text-blue-200/70 group-hover:text-white"
          }
        />

        <span className="flex-1">{item.label}</span>

        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
        )}
      </Link>
    );
  };

  return (
    <aside
      className="
        sticky top-0 z-40
        flex h-screen w-[248px] flex-none flex-col
        bg-[#172554]
        text-white
        shadow-[4px_0_24px_rgba(15,23,42,0.08)]
      "
    >
      {/* BRAND */}

      <div className="flex h-[72px] items-center px-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl bg-white text-[#2563eb]
              text-sm font-extrabold
              shadow-lg
            "
          >
            HR
          </div>

          <div>
            <div className="text-[17px] font-bold tracking-tight">
              HRHub
            </div>

            <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-blue-200/70">
              Enterprise HRMS
            </div>
          </div>
        </Link>
      </div>

      {/* COMPANY SELECTOR */}

      <div className="px-3 pb-4">
        <button
          className="
            flex w-full items-center gap-3
            rounded-xl border border-white/10
            bg-white/[0.07]
            px-3 py-2.5
            text-left
            hover:bg-white/[0.11]
          "
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-xs font-bold">
            E
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">
              Enterprise HRMS
            </div>
            <div className="truncate text-[10px] text-blue-200/60">
              Main Workspace
            </div>
          </div>

          <ChevronDown size={14} className="text-blue-200/60" />
        </button>
      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 overflow-y-auto px-3 pb-5">

        <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-200/45">
          Workspace
        </p>

        <div className="space-y-1">
          {primary.map(renderItem)}
        </div>

        <div className="my-5 h-px bg-white/10" />

        <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-200/45">
          People
        </p>

        <div className="space-y-1">
          {people.map(renderItem)}
        </div>

        <div className="my-5 h-px bg-white/10" />

        <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-200/45">
          Manage
        </p>

        <div className="space-y-1">
          {manage.map(renderItem)}
        </div>

      </nav>

      {/* BOTTOM */}

      <div className="border-t border-white/10 p-3">

        <Link
          href="/settings"
          className="
            flex items-center gap-3 rounded-lg
            px-3 py-2.5 text-[13px]
            font-medium text-blue-100/75
            hover:bg-white/10 hover:text-white
          "
        >
          <Settings size={17} />
          Settings
        </Link>

        <div className="mt-3 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3">

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-[11px] font-bold">
            A
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">
              Admin
            </p>
            <p className="truncate text-[10px] text-blue-200/55">
              Administrator
            </p>
          </div>

          <ChevronRight
            size={14}
            className="text-blue-200/40"
          />

        </div>

      </div>
    </aside>
  );
}
