import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: "brand" | "emerald" | "sky" | "amber" | "violet";
  className?: string;
};

const ACCENTS = {
  brand: "text-brand bg-brand/10",
  emerald: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
  sky: "text-sky-600 bg-sky-500/10 dark:text-sky-400",
  amber: "text-amber-800 bg-amber-500/10 dark:text-amber-400",
  violet: "text-violet-600 bg-violet-500/10 dark:text-violet-400",
};

export function StatCard({ label, value, hint, icon: Icon, accent = "brand", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-borderSubtle bg-surface p-4 shadow-card transition hover:border-brand/20 dark:shadow-none dark:hover:border-borderSubtle/80",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", ACCENTS[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-textMuted">{label}</p>
          <p className="text-xl font-bold tracking-tight text-textPrimary">{value}</p>
          {hint ? <p className="mt-0.5 text-xs text-textMuted">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
