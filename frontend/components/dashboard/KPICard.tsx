import { Card } from "@/components/ui/Card";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  accent?: "brand" | "accent" | "success" | "warning";
}

const ACCENT_STYLES: Record<string, string> = {
  brand: "bg-brand/10 text-brand",
  accent: "bg-accent-soft text-accent",
  success: "bg-green-50 text-green-600",
  warning: "bg-amber-50 text-amber-600",
};

export function KPICard({ label, value, icon: Icon, trend, accent = "brand" }: KPICardProps) {
  return (
    <Card className="group flex items-start justify-between animate-fade-up transition-all duration-200 hover:shadow-lift hover:-translate-y-0.5">
      <div>
        <p className="text-sm text-ink-faint">{label}</p>
        <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">{value}</p>
        {trend && <p className="mt-1 text-xs font-medium text-green-600">{trend}</p>}
      </div>
      <div className={clsx("rounded-lg p-2.5 transition-transform group-hover:scale-105", ACCENT_STYLES[accent])}>
        <Icon size={20} />
      </div>
    </Card>
  );
}
