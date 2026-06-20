import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "brand" | "success" | "warning" | "muted" | "locked";

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-white/10 text-textSecondary",
  brand: "bg-brand/15 text-brand",
  success: "bg-emerald-500/15 text-emerald-400",
  warning: "bg-amber-500/15 text-amber-400",
  muted: "bg-white/5 text-textMuted",
  locked: "bg-white/5 text-textMuted border border-borderSubtle",
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
