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
  violet: "text-brand border-brand/20 bg-brand/5",
  indigo: "text-accent border-accent/20 bg-accent/5",
  sky: "text-accent border-accent/20 bg-accent/5",
  emerald: "text-brand border-brand/20 bg-brand/5",
  amber: "text-amber-600 border-amber-500/20 bg-amber-500/5 dark:text-amber-400",
  rose: "text-red-600 border-red-500/20 bg-red-500/5 dark:text-red-400",
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
        "group relative overflow-hidden rounded-xl border border-borderSubtle bg-surface p-5 shadow-card transition hover:border-brand/40",
        className,
      )}
    >
      <div className="relative z-10 flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
            ACCENTS[accent],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-textMuted">{label}</p>
          <p className="mt-1 font-headline text-2xl font-bold leading-none tracking-tight text-textPrimary">
            {value}
          </p>
          {hint ? <p className="mt-1.5 text-xs text-textSecondary">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
