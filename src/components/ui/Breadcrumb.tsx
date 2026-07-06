import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("mb-6", className)}>
      <ol className="flex flex-wrap items-center gap-1 rounded-xl border border-borderSubtle bg-surface/90 px-3 py-2 text-sm shadow-card backdrop-blur-sm dark:bg-surface/70 sm:gap-1.5 sm:px-4 sm:py-2.5 ring-1 ring-brand/5 dark:ring-transparent">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 max-w-full items-center gap-1 sm:gap-1.5">
              {index > 0 ? (
                <ChevronRight
                  className="h-3.5 w-3.5 shrink-0 text-textMuted"
                  aria-hidden
                />
              ) : null}

              {isFirst ? (
                <Home className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
              ) : null}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="truncate text-textSecondary transition-colors hover:text-brand"
                  title={item.label}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate",
                    isLast
                      ? "font-medium text-textPrimary"
                      : "text-textSecondary",
                  )}
                  title={item.label}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
