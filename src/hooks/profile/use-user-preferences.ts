"use client";

import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_USER_PREFERENCES,
  loadUserPreferences,
  saveUserPreferences,
  type UserPreferences,
} from "@/lib/learning/user-preferences";

export function useUserPreferences(userId: string | undefined) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) {
      setPrefs(DEFAULT_USER_PREFERENCES);
      setReady(true);
      return;
    }
    setPrefs(loadUserPreferences(userId));
    setReady(true);
  }, [userId]);

  const updatePreferences = useCallback(
    (patch: Partial<UserPreferences>) => {
      if (!userId) return DEFAULT_USER_PREFERENCES;
      const next = saveUserPreferences(userId, patch);
      setPrefs(next);
      return next;
    },
    [userId],
  );

  return { prefs, ready, updatePreferences };
}
