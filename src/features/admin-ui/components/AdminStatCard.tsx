import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "violet" | "indigo" | "sky" | "emerald" | "amber" | "rose";
  className?: string;
};

const ACCENTS = {
  violet: "text-violet-400 bg-violet-500/15",
  indigo: "text-indigo-400 bg-indigo-500/15",
  sky: "text-sky-400 bg-sky-500/15",
  emerald: "text-emerald-400 bg-emerald-500/15",
  amber: "text-amber-400 bg-amber-500/15",
  rose: "text-rose-400 bg-rose-500/15",
};

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "violet",
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-borderSubtle bg-surface/80 p-5 backdrop-blur-sm transition hover:border-violet-500/20",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            ACCENTS[accent],
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-textMuted">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-textPrimary">{value}</p>
          {hint ? <p className="mt-1 text-xs text-textMuted">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
