import { cn } from "@/lib/utils";

type ProgressBarProps = {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
};

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, max > 0 ? Math.round((value / max) * 100) : value));

  const heights = { sm: "h-1", md: "h-2", lg: "h-3" };

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-xs text-textMuted">
          <span>{label ?? "Progress"}</span>
          <span className="font-medium text-textSecondary">{pct}%</span>
        </div>
      )}
      <div
        className={cn("overflow-hidden rounded-full bg-overlay-medium dark:bg-borderSubtle/80", heights[size])}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-brand to-accent transition-all duration-500 dark:to-emerald-400",
            pct === 100 && "from-accent to-brandBright dark:from-emerald-500 dark:to-emerald-300",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
