"use client";

import { ReactNode } from "react";

interface NavItem {
  label: string;
  icon: string;
  href: string;
  active?: boolean;
}

interface Props {
  sectionLabel: string;
  navItems: NavItem[];
  userName: string;
  userRole: string;
  children: ReactNode;
}

export default function WorkspaceShell({ sectionLabel, navItems, userName, userRole, children }: Props) {
  const initial = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex min-h-screen bg-[#f6f8fc]">
      <aside className="w-60 bg-[#0b1f4b] text-[#dbeafe] fixed inset-y-0 left-0 p-3">
        <div className="font-extrabold text-xl px-3 pt-2 pb-6 text-white">
          HR<span className="text-[#60a5fa]">Hub</span>
        </div>
        <div className="text-[9px] uppercase tracking-widest text-[#7892bf] px-3 pt-4 pb-2">
          {sectionLabel}
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] " +
                (item.active ? "bg-[#24477f] text-white" : "text-[#bcd0ef] hover:bg-[#152f61]")
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div className="text-[9px] uppercase tracking-widest text-[#7892bf] px-3 pt-6 pb-2">
          Account
        </div>
        <a href="/api/auth/logout" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-[#bcd0ef] hover:bg-[#152f61]">
          <span>↪</span> <span>Sign out</span>
        </a>
      </aside>

      <main className="ml-60 flex-1">
        <header className="h-[68px] bg-white border-b border-[#e7ebf2] flex items-center justify-between px-8">
          <div>
            <div className="text-[17px] font-bold text-[#0f172a]">{sectionLabel}</div>
            <div className="text-[11px] text-[#94a3b8] mt-0.5">Premium HRMS workspace</div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#dbeafe] text-[#1d4ed8] grid place-items-center text-xs font-extrabold">
              {initial}
            </div>
            <div>
              <div className="text-xs font-bold">{userName}</div>
              <div className="text-[10px] text-[#94a3b8] capitalize">{userRole}</div>
            </div>
          </div>
        </header>

        <div className="p-7 max-w-[1450px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
