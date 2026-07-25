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
        "relative overflow-hidden rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/12 via-surface to-accent/10 p-6 sm:p-8",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand/12 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand">
              {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-textSecondary">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}
