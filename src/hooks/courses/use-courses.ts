"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { authedFetch } from "@/lib/security/client-auth";
import type { ApiCourseListItem } from "@/types/course.types";

type CoursesResponse = { ok: true; courses: ApiCourseListItem[] };

async function fetchCourses(): Promise<ApiCourseListItem[]> {
  const res = await authedFetch(ROUTES.API.COURSES.LIST);
  if (!res.ok) return [];
  const data = (await res.json()) as CoursesResponse;
  return Array.isArray(data.courses) ? data.courses : [];
}

/** Published course catalog from GET /api/v1/courses (DB or static fallback). */
export function useCourses() {
  const { isAuthenticated, authReady } = useAuth();

  const query = useQuery({
    queryKey: ["courses", "list"],
    queryFn: fetchCourses,
    enabled: authReady,
    staleTime: 60_000,
  });

  return {
    data: query.data ?? [],
    isLoading: authReady && query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isAuthenticated,
  };
}
