"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/auth-context";
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

async function fetchLeaderboard(courseId: string): Promise<LeaderboardEntry[]> {
  const res = await authedFetch(`/api/v1/leaderboard/${encodeURIComponent(courseId)}`);
  if (!res.ok) return [];

  const data = (await res.json()) as LeaderboardResponse;
  if (!Array.isArray(data.leaderboard)) return [];
  return data.leaderboard;
}

export function useLeaderboard(courseId?: string) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["leaderboard", courseId ?? "none"],
    queryFn: () => fetchLeaderboard(courseId!),
    enabled: Boolean(courseId),
    staleTime: 60_000,
  });

  const entries = (query.data ?? []).map((entry) => ({
    ...entry,
    isCurrentUser: entry.userId === user?.id || entry.isCurrentUser === true,
  }));

  return {
    entries,
    isLoading: Boolean(courseId) && query.isLoading,
    error: query.error,
    refetch: query.refetch,
    isMock: false,
    isEmpty: Boolean(courseId) && !query.isLoading && entries.length === 0,
    fromApi: Boolean(query.data),
  };
}
