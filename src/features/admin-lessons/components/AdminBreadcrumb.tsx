import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

export function AdminBreadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          {i > 0 ? <ChevronRight className="h-3.5 w-3.5 text-textMuted" /> : null}
          {item.href ? (
            <Link
              href={item.href}
              className="text-textMuted transition hover:text-violet-400"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn("font-medium text-textSecondary")}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
