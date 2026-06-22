"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Search, X } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { SearchResultItem } from "@/features/search/components/SearchResultItem";
import { ROUTES } from "@/constants/routes";
import { useStudentSearch } from "@/hooks/search/use-student-search";
import {
  SEARCH_TYPE_LABELS,
  clearRecentSearches,
  groupSearchResults,
  type SearchFilter,
  type SearchResultType,
} from "@/lib/learning/search";
import { cn } from "@/lib/utils";

const FILTERS: SearchFilter[] = [
  "all",
  "course",
  "lesson",
  "module",
  "bookmark",
  "note",
];

export function StudentSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [filter, setFilter] = useState<SearchFilter>("all");
  const { query, setQuery, debouncedQuery, results: allResults, recentSearches, submitSearch, refreshRecent } =
    useStudentSearch(initialQ, "all");

  const results = useMemo(
    () => (filter === "all" ? allResults : allResults.filter((r) => r.type === filter)),
    [allResults, filter],
  );

  useEffect(() => {
    if (initialQ) setQuery(initialQ);
  }, [initialQ, setQuery]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      const params = new URLSearchParams();
      params.set("q", debouncedQuery.trim());
      router.replace(`${ROUTES.STUDENT.SEARCH}?${params.toString()}`, { scroll: false });
    }
  }, [debouncedQuery, router]);

  const groups = useMemo(() => groupSearchResults(results), [results]);
  const hasQuery = debouncedQuery.trim().length >= 2;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    submitSearch();
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <header className="relative overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/10 via-surface to-emerald-500/5 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand">
          <Search className="h-3.5 w-3.5" />
          Search
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Find anything you&apos;ve learned</h1>
        <p className="mt-2 max-w-xl text-sm text-textSecondary">
          Search across courses, modules, lessons, bookmarks, and your personal notes.
        </p>

        <form onSubmit={handleSubmit} className="relative mt-5">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-textMuted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try forex, psychology, risk management…"
            className="w-full rounded-xl border border-borderSubtle bg-black/30 py-3.5 pl-12 pr-12 text-sm text-textPrimary outline-none ring-brand/30 placeholder:text-textMuted focus:border-brand/40 focus:ring-2"
            autoFocus
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-textMuted hover:bg-white/5 hover:text-textPrimary"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </form>
      </header>

      {recentSearches.length > 0 && !hasQuery ? (
        <section className="rounded-2xl border border-borderSubtle bg-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-sm font-medium text-textSecondary">
              <Clock className="h-4 w-4" />
              Recent searches
            </p>
            <button
              type="button"
              onClick={() => {
                clearRecentSearches();
                refreshRecent();
              }}
              className="text-xs text-textMuted hover:text-brand"
            >
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term);
                  submitSearch(term);
                }}
                className="rounded-full border border-borderSubtle bg-black/20 px-3 py-1.5 text-sm text-textSecondary hover:border-brand/30 hover:text-brand"
              >
                {term}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {hasQuery ? (
        <>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const count =
                f === "all"
                  ? allResults.length
                  : allResults.filter((r) => r.type === f).length;
              const label =
                f === "all" ? "All" : SEARCH_TYPE_LABELS[f as SearchResultType];
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition",
                    filter === f
                      ? "bg-brand/15 text-brand"
                      : "bg-white/5 text-textMuted hover:text-textSecondary",
                  )}
                >
                  {label}
                  {hasQuery ? ` (${count})` : ""}
                </button>
              );
            })}
          </div>

          {results.length > 0 ? (
            <div className="space-y-6">
              {(filter === "all"
                ? (["lesson", "course", "module", "bookmark", "note"] as SearchResultType[])
                : [filter as SearchResultType]
              ).map((type) => {
                const items = groups[type];
                if (items.length === 0) return null;
                return (
                  <section
                    key={type}
                    className="rounded-2xl border border-borderSubtle bg-surface p-3 sm:p-4"
                  >
                    <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-widest text-textMuted">
                      {SEARCH_TYPE_LABELS[type]} ({items.length})
                    </h2>
                    <div className="space-y-1">
                      {items.map((result) => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onSelect={() => submitSearch(query)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title={`No results for "${debouncedQuery}"`}
              description="Try different keywords, check spelling, or search for a course topic like stocks or trading psychology."
              icon={Search}
            />
          )}
        </>
      ) : (
        <EmptyState
          title="Start typing to search"
          description="Search lessons by title, find courses by topic, or look up text in your saved notes."
          icon={Search}
        />
      )}
    </div>
  );
}
