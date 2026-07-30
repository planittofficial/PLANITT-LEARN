"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AnalyticsStatProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "brand" | "emerald" | "sky" | "amber" | "violet" | "rose";
  large?: boolean;
};

const ACCENT_COLORS = {
  brand: "text-brand border-brand/20 bg-brand/5",
  emerald: "text-[#10b981] border-[#10b981]/20 bg-[#10b981]/5",
  sky: "text-accent border-accent/20 bg-accent/5",
  amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  violet: "text-brand border-brand/20 bg-brand/5",
  rose: "text-red-400 border-red-500/20 bg-red-500/5",
};

export function AnalyticsStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "brand",
  large,
}: AnalyticsStatProps) {
  const accentStyle = ACCENT_COLORS[accent] || ACCENT_COLORS.brand;

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md p-5 shadow-2xl group hover:border-brand/40 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-mono text-[9px] uppercase tracking-widest text-textMuted">{label}</p>
          <p className={cn("font-mono font-extrabold text-textPrimary leading-none", large ? "text-3xl" : "text-2xl")}>
            {value}
          </p>
          {hint ? <p className="font-mono text-[10px] text-textSecondary uppercase tracking-wider">{hint}</p> : null}
        </div>
        <div className={cn("rounded p-2 border", accentStyle)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
