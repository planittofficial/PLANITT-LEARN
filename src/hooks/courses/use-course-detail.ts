"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { withApiCredentials } from "@/lib/security/client-auth";
import type { ApiCourseDetail } from "@/types/course.types";

type CourseDetailResponse = { ok: true; course: ApiCourseDetail };

async function fetchCourseDetail(courseId: string): Promise<ApiCourseDetail | null> {
  const res = await fetch(ROUTES.API.COURSES.detail(courseId), withApiCredentials());
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
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
