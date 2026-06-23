import { cn } from "@/lib/utils";

type AdminButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-violet-500 to-indigo-500 font-semibold text-white shadow-lg shadow-violet-500/20 hover:brightness-110",
  secondary:
    "border border-borderSubtle bg-surface text-textSecondary hover:border-violet-500/30 hover:text-textPrimary",
  danger: "border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/15",
  ghost: "text-textSecondary hover:bg-overlay-hover hover:text-textPrimary",
};

const SIZES = {
  sm: "rounded-lg px-3 py-1.5 text-xs",
  md: "rounded-xl px-4 py-2.5 text-sm",
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
        "inline-flex items-center justify-center gap-2 transition disabled:cursor-not-allowed disabled:opacity-50",
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
