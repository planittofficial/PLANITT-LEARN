"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { authedFetch } from "@/lib/security/client-auth";
import type { ApiCourseListItem } from "@/types/course.types";

type CoursesResponse = { ok: true; courses: ApiCourseListItem[] };

async function fetchCourses(): Promise<ApiCourseListItem[]> {
  const res = await authedFetch(ROUTES.API.COURSES.LIST);
  if (res.status === 503) throw new Error("DATABASE_UNAVAILABLE");
  if (!res.ok) throw new Error("COURSES_FETCH_FAILED");
  const data = (await res.json()) as CoursesResponse;
  return Array.isArray(data.courses) ? data.courses : [];
}

/** Published course catalog from GET /api/v1/courses. */
export function useCourses() {
  const { isAuthenticated, authReady } = useAuth();

  const query = useQuery({
    queryKey: ["courses", "list"],
    queryFn: fetchCourses,
    enabled: authReady,
    staleTime: 60_000,
    retry: (failureCount, error) =>
      error instanceof Error && error.message === "DATABASE_UNAVAILABLE"
        ? failureCount < 2
        : false,
  });

  return {
    data: query.data ?? [],
    isLoading: authReady && query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isAuthenticated,
  };
}
