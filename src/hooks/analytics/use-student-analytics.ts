"use client";

import { useMemo } from "react";

import { useAuth } from "@/context/auth-context";
import { useLeaderboard } from "@/hooks/leaderboard/use-leaderboard";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import {
  getStudentAnalytics,
  type StudentAnalyticsSnapshot,
} from "@/lib/learning/student-analytics";

export type StudentAnalyticsWithRank = StudentAnalyticsSnapshot & {
  leaderboardRank: number | null;
  leaderboardScore: number | null;
};

export function useStudentAnalytics() {
  const { user, isAuthenticated, authReady } = useAuth();
  const { enrolledIds } = useEnrollment();

  const primaryCourseId = useMemo(() => [...enrolledIds][0] ?? "", [enrolledIds]);

  const { entries, isLoading: leaderboardLoading } = useLeaderboard(
    primaryCourseId || undefined,
  );

  const analytics = useMemo(() => {
    if (!user?.id) return null;
    return getStudentAnalytics(user.id);
  }, [user?.id]);

  const me = entries.find((e) => e.userId === user?.id) ?? entries.find((e) => e.isCurrentUser);

  const data: StudentAnalyticsWithRank | null = analytics
    ? {
        ...analytics,
        leaderboardRank: me?.rank ?? null,
        leaderboardScore: me?.totalScore ?? null,
      }
    : null;

  return {
    data,
    isLoading: !authReady,
    leaderboardLoading,
    isAuthenticated,
  };
}
