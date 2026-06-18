"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { withApiCredentials } from "@/lib/security/client-auth";
import type { LessonProgressState, WatchHeartbeatResult } from "@/types/progress.types";

type ProgressGetResponse = { ok: true; progress: LessonProgressState | null };
type ProgressPostResponse = WatchHeartbeatResult & { ok: true };

async function fetchLessonProgress(lessonId: string): Promise<LessonProgressState | null> {
  const res = await fetch(ROUTES.API.LESSONS.progress(lessonId), withApiCredentials());
  if (!res.ok) return null;
  const data = (await res.json()) as ProgressGetResponse;
  return data.progress ?? null;
}

async function postHeartbeat(
  lessonId: string,
  payload: { watchedSeconds: number; durationSeconds: number },
): Promise<ProgressPostResponse | null> {
  const res = await fetch(
    ROUTES.API.LESSONS.progress(lessonId),
    withApiCredentials({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  );
  if (!res.ok) return null;
  return (await res.json()) as ProgressPostResponse;
}

/** Server progress for a lesson — GET + POST heartbeat (G7 / S9). */
export function useLessonProgress(lessonId: string, enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["progress", lessonId],
    queryFn: () => fetchLessonProgress(lessonId),
    enabled: enabled && Boolean(lessonId),
    staleTime: 30_000,
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (payload: { watchedSeconds: number; durationSeconds: number }) =>
      postHeartbeat(lessonId, payload),
    onSuccess: (result) => {
      if (!result) return;
      const next: LessonProgressState = {
        lessonId,
        watchedSeconds: result.watchedSeconds,
        watchPercent: result.watchPercent,
        completed: result.completed,
        completedAt: result.completed ? new Date().toISOString() : null,
      };
      queryClient.setQueryData(["progress", lessonId], next);
    },
  });

  return {
    progress: query.data,
    isLoading: query.isLoading,
    completed: query.data?.completed ?? false,
    watchPercent: query.data?.watchPercent ?? 0,
    sendHeartbeat: mutation.mutate,
    sendHeartbeatAsync: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}
