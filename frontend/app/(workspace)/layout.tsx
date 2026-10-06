"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/styles/enterprise-v2.css";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";
import { useAuthStore } from "@/store/auth.store";
import { authService } from "@/services/auth.service";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    if (!user) {
      authService
        .me()
        .then(setUser)
        .catch(() => {
          router.replace("/login");
        });
    }
  }, [user, setUser, router]);

  useEffect(() => {
    // HR/Admin belong in the full HR console, not the self-service
    // workspace — send them back if they land here directly.
    if (user && HR_ROLES.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <WorkspaceSidebar />
      <main className="min-w-0 flex-1 bg-[#f5f7fb]">{children}</main>
    </div>
  );
}
