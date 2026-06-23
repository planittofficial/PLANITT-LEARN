"use client";

import { Search } from "lucide-react";

import { useSearchPalette } from "@/features/search/search-context";
import { cn } from "@/lib/utils";

type SearchTriggerProps = {
  className?: string;
  compact?: boolean;
};

export function SearchTrigger({ className, compact }: SearchTriggerProps) {
  const { openSearch } = useSearchPalette();

  if (compact) {
    return (
      <button
        type="button"
        onClick={openSearch}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-textSecondary outline-none transition hover:bg-overlay-hover hover:text-textPrimary focus-visible:ring-2 focus-visible:ring-brand/30",
          className,
        )}
        aria-label="Search"
      >
        <Search className="h-[18px] w-[18px]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openSearch}
      className={cn(
        "inline-flex h-9 w-full shrink-0 items-center gap-2 rounded-lg border border-borderSubtle bg-base px-2.5 text-left text-sm text-textMuted outline-none transition hover:border-brand/25 focus-visible:ring-2 focus-visible:ring-brand/30",
        className,
      )}
      aria-label="Search courses and lessons"
    >
      <Search className="h-3.5 w-3.5 shrink-0 opacity-70" />
      <span className="min-w-0 flex-1 truncate text-xs">Search…</span>
      <kbd className="hidden shrink-0 rounded border border-borderSubtle bg-surface px-1 py-px text-[10px] font-medium leading-none text-textMuted lg:inline">
        ⌘K
      </kbd>
    </button>
  );
}
