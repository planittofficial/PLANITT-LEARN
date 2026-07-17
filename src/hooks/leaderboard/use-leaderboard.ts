"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { authedFetch } from "@/lib/security/client-auth";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  totalScore: number;
  completionPercent: number;
  lessonsCompleted: number;
  isCurrentUser?: boolean;
};

type LeaderboardResponse = {
  ok: true;
  leaderboard: LeaderboardEntry[];
};

async function fetchLeaderboard(
  courseId?: string,
): Promise<{ entries: LeaderboardEntry[]; fromApi: boolean }> {
  const url = courseId
    ? `/api/v1/leaderboard/${courseId}`
    : "/api/v1/leaderboard/learn-forex-master-track";

  const res = await authedFetch(url);
  if (!res.ok) {
    return { entries: [], fromApi: false };
  }

  const data = (await res.json()) as LeaderboardResponse;
  if (!Array.isArray(data.leaderboard)) {
    return { entries: [], fromApi: false };
  }

  return { entries: data.leaderboard, fromApi: true };
}

export function useLeaderboard(courseId?: string) {
  const query = useQuery({
    queryKey: ["leaderboard", courseId ?? "default"],
    queryFn: () => fetchLeaderboard(courseId),
    staleTime: 60_000,
  });

  return {
    entries: query.data?.entries ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isMock: false,
    isEmpty: !query.isLoading && (query.data?.entries.length ?? 0) === 0,
    fromApi: query.data?.fromApi ?? false,
  };
}
