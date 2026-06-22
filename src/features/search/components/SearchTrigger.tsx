"use client";

import { Search } from "lucide-react";

import { useSearchPalette } from "@/features/search/search-context";
import { cn } from "@/lib/utils";

type SearchTriggerProps = {
  className?: string;
};

export function SearchTrigger({ className }: SearchTriggerProps) {
  const { openSearch } = useSearchPalette();

  return (
    <button
      type="button"
      onClick={openSearch}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border border-borderSubtle bg-black/20 px-3 py-1.5 text-sm text-textMuted transition hover:border-brand/30 hover:text-textSecondary",
        className,
      )}
      aria-label="Search"
    >
      <Search className="h-4 w-4 shrink-0" />
      <span className="hidden lg:inline">Search courses, lessons…</span>
      <span className="lg:hidden">Search</span>
      <kbd className="ml-2 hidden rounded border border-borderSubtle bg-surface px-1.5 py-0.5 text-[10px] font-medium text-textMuted md:inline">
        ⌘K
      </kbd>
    </button>
  );
}
