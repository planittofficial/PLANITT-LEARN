"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { authedFetch, isClientDevStandalone } from "@/lib/security/client-auth";
import type { EnrollmentMeResponse, EnrollmentPreviewResponse } from "@/types/enrollment.types";

async function fetchEnrollmentMe(): Promise<EnrollmentMeResponse | null> {
  const res = await authedFetch(ROUTES.API.ENROLLMENT.ME);
  if (!res.ok) return null;
  const data = (await res.json()) as EnrollmentMeResponse;
  if (!data.ok || !Array.isArray(data.enrolledCourseIds)) return null;
  return data;
}

async function fetchDevPreview(): Promise<Set<string>> {
  const res = await fetch(ROUTES.API.ENROLLMENT.PREVIEW);
  if (!res.ok) return new Set();
  const data = (await res.json()) as EnrollmentPreviewResponse;
  return new Set(Array.isArray(data.enrolledCourseIds) ? data.enrolledCourseIds : []);
}

/**
 * Enrollment state for the student UI.
 * Server-resolved enrolledCourseIds from /api/v1/enrollment/me
 * (payment history from Planitt appbackend + optional Learn DB webhook sync).
 */
export function useEnrollment() {
  const { isAuthenticated, authReady, devStandalone } = useAuth();
  const standalone = devStandalone || isClientDevStandalone();

  const enrollmentQuery = useQuery({
    queryKey: ["enrollment", "me"],
    queryFn: fetchEnrollmentMe,
    enabled: authReady && isAuthenticated,
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });

  const previewQuery = useQuery({
    queryKey: ["enrollment", "preview"],
    queryFn: fetchDevPreview,
    enabled: authReady && !isAuthenticated && standalone,
    staleTime: 15_000,
  });

  const enrolledIds = isAuthenticated
    ? new Set(enrollmentQuery.data?.enrolledCourseIds ?? [])
    : previewQuery.data ?? new Set<string>();

  const loading =
    !authReady ||
    (isAuthenticated && enrollmentQuery.isLoading) ||
    (!isAuthenticated && standalone && previewQuery.isLoading);

  return {
    authReady,
    isAuthenticated,
    devPreview: !isAuthenticated && standalone,
    devStandalone: standalone,
    loading,
    enrolledIds,
    /** Raw payment rows from appbackend (paid learn-* plan_ids). */
    paymentItems: enrollmentQuery.data?.items ?? [],
    enrollmentSource: enrollmentQuery.data?.source,
    refetch: isAuthenticated ? enrollmentQuery.refetch : previewQuery.refetch,
    isEnrolledIn: (courseId: string) => isEnrolledInCourse(enrolledIds, courseId),
  };
}
