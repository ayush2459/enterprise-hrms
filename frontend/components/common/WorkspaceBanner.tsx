"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";

interface WorkspaceBannerProps {
  eyebrow?: string;
  title: string;
  description: string;
  accent?: "blue" | "violet" | "emerald" | "amber";
}

const accents = {
  blue: "from-blue-600 to-indigo-600",
  violet: "from-violet-600 to-blue-600",
  emerald: "from-emerald-600 to-teal-600",
  amber: "from-amber-500 to-orange-600",
};

export function WorkspaceBanner({
  eyebrow = "HR WORKSPACE",
  title,
  description,
  accent = "blue",
}: WorkspaceBannerProps) {
  return (
    <section className="hr-workspace-banner relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className={`absolute inset-y-0 right-0 w-2/5 bg-gradient-to-br ${accents[accent]} opacity-[0.08]`} />
      <div className="absolute -right-8 -top-16 h-44 w-44 rounded-full border-[22px] border-blue-100/60" />
      <div className="absolute right-24 bottom-[-56px] h-36 w-36 rounded-full border-[18px] border-indigo-100/50" />
      <div className="relative flex flex-col gap-5 px-5 py-5 sm:px-7 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[0.14em] text-blue-600">
            <Sparkles size={12} />
            {eyebrow}
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
          <p className="mt-1.5 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.10)]" />
          Live workspace
          <ArrowUpRight size={13} className="text-slate-400" />
        </div>
      </div>
    </section>
  );
}
