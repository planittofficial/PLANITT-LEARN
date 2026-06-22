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

const ACCENTS = {
  brand: "from-brand/20 to-brand/5 border-brand/20 text-brand",
  emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20 text-emerald-400",
  sky: "from-sky-500/20 to-sky-500/5 border-sky-500/20 text-sky-400",
  amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20 text-amber-400",
  violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20 text-violet-400",
  rose: "from-rose-500/20 to-rose-500/5 border-rose-500/20 text-rose-400",
};

export function AnalyticsStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "brand",
  large,
}: AnalyticsStatProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5",
        ACCENTS[accent],
        large && "sm:p-6",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-textMuted">{label}</p>
          <p className={cn("mt-2 font-bold text-textPrimary", large ? "text-3xl" : "text-2xl")}>
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-textSecondary">{hint}</p> : null}
        </div>
        <div className={cn("rounded-xl bg-black/20 p-2.5", ACCENTS[accent].split(" ")[2])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
