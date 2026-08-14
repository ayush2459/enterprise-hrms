import "@/styles/enterprise-v2.css";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#f5f7fb]">
      <Sidebar />
      <main className="min-w-0 flex-1 bg-[#f5f7fb]">
        {children}
      </main>
    </div>
  );
}
