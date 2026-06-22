"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Search, X } from "lucide-react";

import { SearchResultItem } from "@/features/search/components/SearchResultItem";
import { ROUTES } from "@/constants/routes";
import { useStudentSearch } from "@/hooks/search/use-student-search";
import {
  SEARCH_TYPE_LABELS,
  groupSearchResults,
  type SearchResultType,
} from "@/lib/learning/search";
import { cn } from "@/lib/utils";

type SearchCommandPaletteProps = {
  open: boolean;
  onClose: () => void;
};

export function SearchCommandPalette({ open, onClose }: SearchCommandPaletteProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { query, setQuery, debouncedQuery, results, recentSearches, submitSearch } =
    useStudentSearch();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (event.key === "Enter" && results[activeIndex]) {
        event.preventDefault();
        submitSearch(query);
        router.push(results[activeIndex].href);
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, results, activeIndex, query, submitSearch, router]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  if (!open) return null;

  const groups = groupSearchResults(results);
  const hasQuery = debouncedQuery.trim().length >= 2;
  const flatResults = results;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close search"
      />

      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-borderSubtle bg-surface shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3 border-b border-borderSubtle px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-textMuted" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, lessons, notes…"
            className="min-w-0 flex-1 bg-transparent text-sm text-textPrimary outline-none placeholder:text-textMuted"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-textMuted hover:bg-white/5 hover:text-textPrimary"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[min(28rem,55vh)] overflow-y-auto p-2">
          {!hasQuery && recentSearches.length > 0 ? (
            <div className="p-2">
              <p className="mb-2 flex items-center gap-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-textMuted">
                <Clock className="h-3 w-3" />
                Recent searches
              </p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setQuery(term);
                      submitSearch(term);
                    }}
                    className="rounded-full border border-borderSubtle bg-black/20 px-3 py-1 text-xs text-textSecondary hover:border-brand/30 hover:text-brand"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {!hasQuery ? (
            <p className="px-4 py-8 text-center text-sm text-textMuted">
              Type at least 2 characters to search your courses and notes.
            </p>
          ) : results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-textMuted">
              No results for &ldquo;{debouncedQuery}&rdquo;
            </p>
          ) : (
            (["lesson", "course", "module", "bookmark", "note"] as SearchResultType[]).map(
              (type) => {
                const items = groups[type];
                if (items.length === 0) return null;
                return (
                  <div key={type} className="mb-3">
                    <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-textMuted">
                      {SEARCH_TYPE_LABELS[type]}
                    </p>
                    {items.slice(0, 5).map((result) => {
                      const idx = flatResults.indexOf(result);
                      return (
                        <div
                          key={result.id}
                          className={cn(idx === activeIndex && "rounded-xl bg-brand/5")}
                        >
                          <SearchResultItem
                            result={result}
                            compact
                            onSelect={() => {
                              submitSearch(query);
                              onClose();
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              },
            )
          )}
        </div>

        <div className="flex items-center justify-between border-t border-borderSubtle px-4 py-2.5 text-[10px] text-textMuted">
          <span>
            <kbd className="rounded border border-borderSubtle bg-black/30 px-1">↑↓</kbd> navigate{" "}
            <kbd className="ml-1 rounded border border-borderSubtle bg-black/30 px-1">↵</kbd> open
          </span>
          <Link
            href={`${ROUTES.STUDENT.SEARCH}?q=${encodeURIComponent(query)}`}
            onClick={() => {
              submitSearch(query);
              onClose();
            }}
            className="font-medium text-brand hover:underline"
          >
            View all results →
          </Link>
        </div>
      </div>
    </div>
  );
}
