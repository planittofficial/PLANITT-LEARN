"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { authedFetch } from "@/lib/security/client-auth";

export type LessonPlayback =
  | {
      provider: "youtube";
      embedUrl: string;
      thumbnailUrl: string;
    }
  | {
      provider: "hosted";
      streamUrl: string;
    };

async function fetchLessonPlayback(lessonId: string): Promise<LessonPlayback | null> {
  const res = await authedFetch(ROUTES.API.LESSONS.playback(lessonId));
  if (!res.ok) return null;
  const data = (await res.json()) as { playback?: LessonPlayback };
  return data.playback ?? null;
}

export function useLessonPlayback(lessonId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["lessons", "playback", lessonId],
    enabled: enabled && Boolean(lessonId),
    queryFn: () => fetchLessonPlayback(lessonId),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
