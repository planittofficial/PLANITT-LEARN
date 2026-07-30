import { cn } from "@/lib/utils";

type AdminButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
};

const VARIANTS = {
  primary:
    "bg-brand text-black font-mono font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(20,184,166,0.15)] hover:brightness-110 active:scale-[0.98]",
  secondary:
    "border border-white/5 bg-[#1C1B1B] text-textSecondary font-mono font-bold uppercase tracking-wider hover:border-brand/40 hover:text-brand active:scale-[0.98]",
  danger: "border border-red-500/20 bg-red-500/5 text-red-400 font-mono font-bold uppercase tracking-wider hover:bg-red-500/10 active:scale-[0.98]",
  ghost: "text-textSecondary font-mono uppercase tracking-wider hover:bg-white/5 hover:text-textPrimary",
};

const SIZES = {
  sm: "rounded-sm px-3 py-1.5 text-[10px] tracking-wide",
  md: "rounded-sm px-4 py-2.5 text-xs tracking-wider",
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
