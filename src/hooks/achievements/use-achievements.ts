"use client";

import { useCallback, useEffect, useState } from "react";

import {
  dismissAchievementNotifications,
  getAchievementsSnapshot,
  syncAchievements,
  type AchievementsSnapshot,
} from "@/lib/learning/achievements";
import { markNotificationsReadByType } from "@/lib/learning/notifications";

const EMPTY: AchievementsSnapshot = {
  achievements: [],
  unlockedCount: 0,
  totalCount: 0,
  recentUnlocks: [],
  pendingNotifications: [],
};

export function useAchievements(userId: string | undefined) {
  const [snapshot, setSnapshot] = useState<AchievementsSnapshot>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!userId) {
      setSnapshot(EMPTY);
      setIsLoading(false);
      return;
    }
    setSnapshot(getAchievementsSnapshot(userId));
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sync = useCallback(() => {
    if (!userId) return [];
    const newlyUnlocked = syncAchievements(userId);
    refresh();
    return newlyUnlocked;
  }, [userId, refresh]);

  const dismissNotifications = useCallback(() => {
    if (!userId) return;
    dismissAchievementNotifications(userId);
    markNotificationsReadByType(userId, "achievement");
    refresh();
  }, [userId, refresh]);

  return {
    ...snapshot,
    isLoading,
    refresh,
    sync,
    dismissNotifications,
  };
}
