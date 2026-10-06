"use client";

import { ReactNode } from "react";

export function HeroBanner({
  eyebrow, title, subtitle, chips, actions,
}: { eyebrow: string; title: string; subtitle: string; chips?: string[]; actions?: ReactNode }) {
  return (
    <section className="bg-gradient-to-[110deg] from-[#172554] to-[#2563eb] rounded-2xl p-6 text-white flex justify-between items-center shadow-[0_10px_28px_#1e3a8a18] flex-wrap gap-4">
      <div>
        <div className="text-[10px] text-[#bfdbfe] font-bold tracking-wider">{eyebrow}</div>
        <h1 className="text-2xl mt-1.5 mb-1 font-bold">{title}</h1>
        <p className="text-[#dbeafe] text-[13px] m-0">{subtitle}</p>
        {chips && (
          <div className="flex gap-1.5 mt-3.5 flex-wrap">
            {chips.map((c) => (
              <span key={c} className="bg-white/10 px-2.5 py-1.5 rounded-full text-[10px]">{c}</span>
            ))}
          </div>
        )}
      </div>
      {actions && <div className="flex gap-2.5">{actions}</div>}
    </section>
  );
}

export function MetricCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="bg-white border border-[#e8edf5] rounded-[13px] shadow-[0_4px_15px_#0f172a08] p-4">
      <div className="text-[10px] text-[#94a3b8]">{label}</div>
      <div className="text-xl font-extrabold mt-1.5">{value}</div>
      {helper && <div className="text-[9px] text-[#94a3b8] mt-1">{helper}</div>}
    </div>
  );
}

export function PanelCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-[#e8edf5] rounded-[13px] shadow-[0_4px_15px_#0f172a08]">
      <div className="px-[19px] py-[17px] border-b border-[#eef2f7]">
        <h2 className="text-[13px] font-bold m-0">{title}</h2>
        {subtitle && <p className="text-[10px] text-[#94a3b8] mt-1 mb-0">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <div className="px-[19px] py-[15px] border-b border-[#f0f3f7] last:border-0 flex justify-between items-center">{children}</div>;
}

export function Pill({ status }: { status: "pending" | "approved" | "rejected" }) {
  const styles = {
    pending: "bg-[#fffbeb] text-[#b45309]",
    approved: "bg-[#ecfdf5] text-[#047857]",
    rejected: "bg-[#fef2f2] text-[#b91c1c]",
  };
  const labels = { pending: "Pending", approved: "Approved", rejected: "Rejected" };
  return <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${styles[status]}`}>{labels[status]}</span>;
}
