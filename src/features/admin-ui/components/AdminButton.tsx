import { cn } from "@/lib/utils";

type AdminButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

const VARIANTS = {
  primary:
    "bg-brand text-brandForeground font-semibold shadow-sm hover:bg-brandHover active:scale-[0.98]",
  secondary:
    "border border-borderSubtle bg-surface text-textSecondary font-semibold hover:border-brand/40 hover:text-brand active:scale-[0.98]",
  danger: "border border-red-200 bg-red-50 text-red-700 font-semibold hover:bg-red-100 active:scale-[0.98]",
  ghost: "text-textSecondary hover:bg-overlay-hover hover:text-textPrimary",
};

const SIZES = {
  sm: "rounded-lg px-3 py-1.5 text-xs",
  md: "rounded-lg px-4 py-2.5 text-sm",
};

export function AdminButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: AdminButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 transition disabled:cursor-not-allowed disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
