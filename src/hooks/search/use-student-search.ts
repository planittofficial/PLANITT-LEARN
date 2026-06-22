"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { useAuth } from "@/context/auth-context";
import {
  getRecentSearches,
  recordRecentSearch,
  searchLearningContent,
  type SearchFilter,
  type SearchResult,
} from "@/lib/learning/search";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function useStudentSearch(initialQuery = "", filter: SearchFilter = "all") {
  const { user } = useAuth();
  const { enrolledIds } = useEnrollment();
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const debouncedQuery = useDebouncedValue(query, 200);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const results = useMemo<SearchResult[]>(() => {
    if (debouncedQuery.trim().length < 2) return [];
    return searchLearningContent(debouncedQuery, {
      userId: user?.id,
      enrolledIds,
      filter,
    });
  }, [debouncedQuery, user?.id, enrolledIds, filter]);

  const submitSearch = useCallback((value?: string) => {
    const next = (value ?? query).trim();
    if (next.length < 2) return;
    recordRecentSearch(next);
    setRecentSearches(getRecentSearches());
  }, [query]);

  return {
    query,
    setQuery,
    debouncedQuery,
    results,
    recentSearches,
    submitSearch,
    refreshRecent: () => setRecentSearches(getRecentSearches()),
  };
}
