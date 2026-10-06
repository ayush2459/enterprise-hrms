"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

const EMPLOYEE_NAV = [
  { href: "/my-workspace", label: "My Workspace", icon: LayoutGrid },
];

const MANAGER_NAV = [
  { href: "/manager", label: "Overview", icon: LayoutGrid },
];

export function WorkspaceSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isManager = user?.role === "reporting_manager";
  const nav = isManager ? MANAGER_NAV : EMPLOYEE_NAV;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-brand-dark px-3 py-5 text-blue-100">
      <div className="px-3 pb-6 text-xl font-extrabold text-white">
        HR<span className="text-brand-light">Hub</span>
      </div>

      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-blue-300/70">
        {isManager ? "Manager Workspace" : "Employee Workspace"}
      </p>

      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-brand text-white"
                  : "text-blue-100/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.14em] text-blue-300/70">
          Account
        </p>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-blue-100/80 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
