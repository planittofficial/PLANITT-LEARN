"use client";

import { useQuery } from "@tanstack/react-query";

import { ROUTES } from "@/constants/routes";
import { withApiCredentials } from "@/lib/security/client-auth";

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

/** Fallback when API unavailable or user not enrolled. */
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: "u1", name: "Priya S.", totalScore: 2840, completionPercent: 92, lessonsCompleted: 46 },
  { rank: 2, userId: "u2", name: "Rahul M.", totalScore: 2650, completionPercent: 88, lessonsCompleted: 41 },
  { rank: 3, userId: "u3", name: "Ananya K.", totalScore: 2410, completionPercent: 81, lessonsCompleted: 38 },
  { rank: 4, userId: "dev-local-001", name: "Local Dev", totalScore: 1980, completionPercent: 65, lessonsCompleted: 28, isCurrentUser: true },
  { rank: 5, userId: "u5", name: "Vikram P.", totalScore: 1720, completionPercent: 58, lessonsCompleted: 24 },
];

async function fetchLeaderboard(courseId?: string): Promise<{ entries: LeaderboardEntry[]; fromApi: boolean }> {
  const url = courseId
    ? `/api/v1/leaderboard/${courseId}`
    : "/api/v1/leaderboard/learn-forex-master-track";

  try {
    const res = await fetch(url, withApiCredentials());
    if (res.ok) {
      const data = (await res.json()) as LeaderboardResponse;
      if (Array.isArray(data.leaderboard)) {
        return { entries: data.leaderboard, fromApi: true };
      }
    }
  } catch {
    // fall through to mock
  }

  return { entries: MOCK_LEADERBOARD, fromApi: false };
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
    isMock: !query.data?.fromApi,
  };
}
