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
  amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  rose: "text-red-400 border-red-500/20 bg-red-500/5",
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
        "rounded-lg border border-borderSubtle bg-surface/60 p-5 backdrop-blur-md transition hover:border-brand/40 shadow-2xl relative overflow-hidden group",
        className,
      )}
    >
      <div className="glow-border" />
      <div className="flex items-start gap-4 relative z-10">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded border",
            ACCENTS[accent],
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[9px] uppercase tracking-widest text-textMuted">{label}</p>
          <p className="mt-1 font-mono text-2xl font-extrabold tracking-tight text-textPrimary leading-none">{value}</p>
          {hint ? <p className="mt-1.5 font-mono text-[9px] text-textSecondary uppercase tracking-wider">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
