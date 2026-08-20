import "@/styles/enterprise-v2.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ModuleCommandCenter } from "@/components/layout/ModuleCommandCenter";
import { PageSearchProvider } from "@/components/layout/PageSearchContext";
import { UniversalPageSearch } from "@/components/layout/UniversalPageSearch";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
