import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "brand" | "success" | "warning" | "muted" | "locked";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-overlay-strong text-textSecondary",
  brand: "bg-brand/10 text-brand",
  success: "bg-brand/10 text-brand dark:bg-brand/15 dark:text-brandBright",
  warning: "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  muted: "bg-overlay-hover text-textMuted",
  locked: "bg-overlay-hover text-textMuted border border-borderSubtle",
};

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
