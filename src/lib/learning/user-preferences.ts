const PREFS_KEY = "alvest_learn_user_prefs";

export type UserPreferences = {
  displayName: string;
  preferredCourseId: string;
  emailDigest: boolean;
  weeklyGoalLessons: number;
  showOnLeaderboard: boolean;
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  displayName: "",
  preferredCourseId: "",
  emailDigest: true,
  weeklyGoalLessons: 3,
  showOnLeaderboard: true,
};

function storageKey(userId: string) {
  return `${PREFS_KEY}:${userId}`;
}

export function loadUserPreferences(userId: string): UserPreferences {
  if (typeof window === "undefined" || !userId) {
    return { ...DEFAULT_USER_PREFERENCES };
  }
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return { ...DEFAULT_USER_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return {
      ...DEFAULT_USER_PREFERENCES,
      ...parsed,
      weeklyGoalLessons: Math.min(
        14,
        Math.max(1, Number(parsed.weeklyGoalLessons) || DEFAULT_USER_PREFERENCES.weeklyGoalLessons),
      ),
    };
  } catch {
    return { ...DEFAULT_USER_PREFERENCES };
  }
}

export function saveUserPreferences(
  userId: string,
  patch: Partial<UserPreferences>,
): UserPreferences {
  const next = {
    ...loadUserPreferences(userId),
    ...patch,
  };
  if (typeof window !== "undefined" && userId) {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
  }
  return next;
}
