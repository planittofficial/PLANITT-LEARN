import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "relative overflow-hidden rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md p-6 sm:p-8 shadow-2xl",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand/5 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-brand font-bold">
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 font-headline text-2xl font-extrabold tracking-tight sm:text-3xl uppercase text-textPrimary">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-xs text-textSecondary leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
