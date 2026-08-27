"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/styles/enterprise-v2.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ModuleCommandCenter } from "@/components/layout/ModuleCommandCenter";
import { PageSearchProvider } from "@/components/layout/PageSearchContext";
import { UniversalPageSearch } from "@/components/layout/UniversalPageSearch";
import { useAuthStore } from "@/store/auth.store";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    // The user object isn't persisted across reloads — rehydrate it from
    // the token so the role guard below has something to check even on a
    // hard refresh, not just right after login.
    if (!user) {
      import("@/services/auth.service").then(({ authService }) => {
        authService
          .me()
          .then(setUser)
          .catch(() => {
            // No valid session in this tab at all — middleware can no
            // longer catch this (tokens live in sessionStorage, which is
            // invisible server-side), so the client has to redirect.
            router.replace("/login");
          });
      });
    }
  }, [user, setUser, router]);

  useEffect(() => {
    // This whole route group is the HR/Admin console. If a manager or
    // employee somehow lands here (stale bookmark, typed URL), send them
    // to their own workspace instead of showing company-wide HR data.
    if (user && !HR_ROLES.includes(user.role)) {
      router.replace(user.role === "reporting_manager" ? "/manager" : "/my-workspace");
    }
  }, [user, router]);

  return (
    <PageSearchProvider>
      <div className="flex min-h-screen bg-[#f5f7fb]">
        <Sidebar />
        <main className="min-w-0 flex-1 bg-[#f5f7fb]">
          <ModuleCommandCenter />
          <UniversalPageSearch />
          {children}
        </main>
      </div>
    </PageSearchProvider>
  );
}
