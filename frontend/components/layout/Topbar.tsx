"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Bell,
  HelpCircle,
  ChevronDown,
  Settings,
  LogOut,
  User,
  Menu,
} from "lucide-react";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { usePageSearch } from "@/components/layout/PageSearchContext";

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const { query, setQuery } = usePageSearch();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");

    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
    } catch {}

    setProfileOpen(false);
    window.location.href = "/login";
  };

  const goToSettings = () => {
    setProfileOpen(false);
    router.push("/settings");
  };

  const goTo = (href: string) => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    router.push(href);
  };

  const goToProfile = () => {
    setProfileOpen(false);
    router.push("/settings");
  };

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center border-b border-slate-200 bg-white px-5 md:px-6">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => window.dispatchEvent(new CustomEvent("hrms:toggle-sidebar"))}
        className="mr-3 flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 lg:hidden"
      >
        <Menu size={18} />
      </button>

      <div className="min-w-0 flex-1">
        {title && <h1 className="truncate text-[18px] font-bold tracking-tight text-slate-900">{title}</h1>}
        {subtitle && <p className="mt-0.5 truncate text-[11px] text-slate-400">{subtitle}</p>}
      </div>

      <div className="hidden md:block">
        <GlobalSearch />
      </div>

      <button
        type="button"
        aria-label="Search"
        onClick={() => {
          setMobileSearchOpen((value) => !value);
          window.dispatchEvent(new CustomEvent("hrms:focus-global-search"));
        }}
        className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
      >
        <span className="text-lg">{mobileSearchOpen ? "×" : "⌕"}</span>
      </button>

      <div className="ml-2 flex items-center gap-1">
        <button
          type="button"
          aria-label="Help"
          title="Help & Support"
          onClick={() => router.push("/settings")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <HelpCircle size={18} />
        </button>

        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => {
              setNotificationsOpen((value) => !value);
              setProfileOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_15px_40px_rgba(15,23,42,.14)]">
              <div className="border-b border-slate-100 px-3 py-3">
                <p className="text-sm font-semibold text-slate-900">Notifications</p>
                <p className="mt-0.5 text-[10px] text-slate-400">Recent HR activity</p>
              </div>
              <div className="px-3 py-5 text-center">
                <Bell size={22} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No new notifications</p>
                <p className="mt-1 text-[10px] text-slate-400">You're all caught up.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mx-2 h-7 w-px bg-slate-200" />

        <div className="relative">
          <button
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => {
              setProfileOpen((value) => !value);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">A</div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800">Admin</p>
              <p className="text-[10px] text-slate-400">Administrator</p>
            </div>
            <ChevronDown size={14} className={profileOpen ? "rotate-180 text-slate-400 transition-transform" : "text-slate-400 transition-transform"} />
          </button>

          {profileOpen && (
            <div role="menu" className="absolute right-0 top-11 z-50 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_15px_40px_rgba(15,23,42,.14)]">
              <div className="mb-1 border-b border-slate-100 px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">A</div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Admin</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">Administrator</p>
                  </div>
                </div>
              </div>

              <button type="button" role="menuitem" onClick={goToProfile} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                <User size={16} /> My Profile
              </button>
              <button type="button" role="menuitem" onClick={goToSettings} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
                <Settings size={16} /> Settings
              </button>
              <div className="my-1 h-px bg-slate-100" />
              <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50">
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="absolute left-0 right-0 top-[72px] border-b border-slate-200 bg-white p-3 shadow-sm md:hidden">
          <GlobalSearch mobile onNavigate={() => setMobileSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}
