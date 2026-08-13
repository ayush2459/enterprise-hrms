"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

function initialsFrom(email?: string) {
  if (!email) return "?";
  return email[0]?.toUpperCase() ?? "?";
}

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white/80 px-8 py-4 backdrop-blur-sm">
      <div>
        <h1 className="font-display text-lg font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-faint">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
            {initialsFrom(user?.official_email)}
          </div>
          <span className="text-sm text-ink-soft">{user?.official_email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-ink-faint transition-colors hover:bg-surface-muted hover:text-ink"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}
