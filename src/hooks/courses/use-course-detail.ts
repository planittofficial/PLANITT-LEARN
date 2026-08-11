"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { authedFetch } from "@/lib/security/client-auth";
import type { ApiCourseDetail } from "@/types/course.types";

type CourseDetailResponse = { ok: true; course: ApiCourseDetail };

async function fetchCourseDetail(courseId: string): Promise<ApiCourseDetail | null> {
  const res = await authedFetch(ROUTES.API.COURSES.detail(courseId));
  if (res.status === 503) {
    throw new Error("DATABASE_UNAVAILABLE");
  }
  if (res.status === 403) {
    throw new Error("NOT_ENROLLED");
  }
  if (res.status >= 500) {
    throw new Error("SERVER_ERROR");
  }
  if (!res.ok) return null;
  const data = (await res.json()) as CourseDetailResponse;
  return data.course ?? null;
}

/** Enrolled course tree from GET /api/v1/courses/:courseId (requires auth + enrollment). */
export function useCourseDetail(courseId: string) {
  const { isAuthenticated, authReady } = useAuth();

  const query = useQuery({
    queryKey: ["courses", "detail", courseId],
    queryFn: () => fetchCourseDetail(courseId),
    enabled: authReady && isAuthenticated && Boolean(courseId),
    staleTime: 60_000,
    retry: (failureCount, error) =>
      error instanceof Error && error.message === "DATABASE_UNAVAILABLE"
        ? failureCount < 2
        : false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isFetched: query.isFetched,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
