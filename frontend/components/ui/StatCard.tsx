interface StatCardProps {
  label: string;
  value: string | number;
  tone?: "default" | "accent" | "warning" | "muted";
}

const TONE_CLASSES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-brand-dark",
  accent: "text-brand",
  warning: "text-amber-600",
  muted: "text-gray-400",
};

export function StatCard({ label, value, tone = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-soft">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${TONE_CLASSES[tone]}`}>{value}</p>
    </div>
  );
}
