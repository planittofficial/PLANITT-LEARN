"use client";

import { useCallback, useEffect, useState } from "react";

import {
  loadGamification,
  type GamificationState,
  touchDailyActivity,
} from "@/lib/learning/gamification";

export function useGamification(userId: string | undefined) {
  const [state, setState] = useState<GamificationState>(() =>
    userId ? loadGamification(userId) : { xp: 0, streak: 0, longestStreak: 0, lastActiveDate: null, lessonsCompletedTotal: 0 },
  );

  const refresh = useCallback(() => {
    if (!userId) return;
    setState(loadGamification(userId));
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const touchActivity = useCallback(() => {
    if (!userId) return;
    setState(touchDailyActivity(userId));
  }, [userId]);

  return { ...state, refresh, touchActivity };
}
