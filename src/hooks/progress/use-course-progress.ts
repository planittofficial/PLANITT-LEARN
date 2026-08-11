"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/context/auth-context";
import {
  loadCourseProgress,
  saveLessonComplete,
  type CourseProgress,
} from "@/lib/learning/progress";
import { authedFetch } from "@/lib/security/client-auth";

type CourseProgressResponse = {
  ok: true;
  progress: CourseProgress;
};

export async function fetchCourseProgress(
  courseId: string,
  userId: string,
): Promise<CourseProgress> {
  const res = await authedFetch(ROUTES.API.COURSES.progress(courseId));
  if (res.status === 503) {
    throw new Error("DATABASE_UNAVAILABLE");
  }
  if (!res.ok) {
    if (process.env.NEXT_PUBLIC_LEARN_DEV_STANDALONE === "true") {
      return loadCourseProgress(userId, courseId);
    }
    return {};
  }
  const data = (await res.json()) as CourseProgressResponse;
  return data.progress ?? {};
}

async function postMarkLessonComplete(lessonId: string): Promise<boolean> {
  const res = await authedFetch(ROUTES.API.LESSONS.progress(lessonId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markComplete: true }),
    });
  return res.ok;
}

/** Server-backed course progress with localStorage fallback when DB is unavailable. */
export function useCourseProgress(courseId: string) {
  const { user, isAuthenticated, authReady } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["progress", "course", courseId, userId],
    queryFn: () => fetchCourseProgress(courseId, userId!),
    enabled: authReady && isAuthenticated && Boolean(courseId) && Boolean(userId),
    staleTime: 30_000,
    retry: (failureCount, error) =>
      error instanceof Error && error.message === "DATABASE_UNAVAILABLE"
        ? failureCount < 2
        : false,
  });

  const markCompleteMutation = useMutation({
    mutationFn: async (lessonId: string) => {
      const apiOk = await postMarkLessonComplete(lessonId);
      if (!apiOk && userId && process.env.NEXT_PUBLIC_LEARN_DEV_STANDALONE === "true") {
        saveLessonComplete(userId, courseId, lessonId);
      }
      return lessonId;
    },
    onSuccess: (lessonId) => {
      if (!userId) return;
      queryClient.setQueryData<CourseProgress>(
        ["progress", "course", courseId, userId],
        (prev) => ({
          ...(prev ?? loadCourseProgress(userId, courseId)),
          [lessonId]: { completed: true, completedAt: new Date().toISOString() },
        }),
      );
      queryClient.invalidateQueries({ queryKey: ["progress", lessonId] });
    },
  });

  const progress =
    query.data ??
    (userId && process.env.NEXT_PUBLIC_LEARN_DEV_STANDALONE === "true"
      ? loadCourseProgress(userId, courseId)
      : {});

  return {
    progress,
    isLoading: query.isLoading,
    markLessonComplete: markCompleteMutation.mutateAsync,
    isMarking: markCompleteMutation.isPending,
    refetch: query.refetch,
  };
}
