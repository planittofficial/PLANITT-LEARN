import { cn } from "@/lib/utils";

const COLORS = [
  "bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand",
  "bg-accent/10 text-textPrimary dark:bg-accent/15 dark:text-accentBright",
  "bg-brand/12 text-brandForeground dark:bg-brand/20 dark:text-brandBright",
  "bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
];

function colorForName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  highlight?: boolean;
};

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export function Avatar({ name, size = "md", className, highlight }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZES[size],
        colorForName(name),
        highlight && "ring-2 ring-brand ring-offset-2 ring-offset-base",
        className,
      )}
      aria-hidden
    >
      {initials(name || "?")}
    </div>
  );
}
