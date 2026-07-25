import { COURSE_CATALOG } from "@/lib/catalog/courses";

import { getTotalMinutesLearned } from "./activity";
import { getBookmarks } from "./bookmarks";
import { loadGamification, getLevelInfo } from "./gamification";
import { getQuizHistory, getQuizStats } from "./quiz-history";
import { loadCourseProgress, countCompletedLessons } from "./progress";

const STORAGE_KEY = "alvest_learn_achievements";

export type AchievementCategory =
  | "streak"
  | "lessons"
  | "level"
  | "course"
  | "engagement"
  | "quiz"
  | "time";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export type AchievementDef = {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon:
    | "flame"
    | "book"
    | "star"
    | "trophy"
    | "layers"
    | "graduation"
    | "bookmark"
    | "pen"
    | "target"
    | "clock"
    | "calendar"
    | "zap";
  target: number;
  rarity: AchievementRarity;
};

export type AchievementProgress = {
  def: AchievementDef;
  unlocked: boolean;
  unlockedAt: string | null;
  current: number;
  target: number;
  percent: number;
};

export type AchievementsSnapshot = {
  achievements: AchievementProgress[];
  unlockedCount: number;
  totalCount: number;
  recentUnlocks: AchievementProgress[];
  pendingNotifications: AchievementProgress[];
};

type AchievementsStore = {
  unlocked: Record<string, string>;
  pendingIds: string[];
};

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  {
    id: "first_lesson",
    category: "lessons",
    title: "First Steps 📈",
    description: "Complete your first trading lesson",
    icon: "book",
    target: 1,
    rarity: "common",
  },
  {
    id: "lessons_5",
    category: "lessons",
    title: "Mini Portfolio 💼",
    description: "Complete 5 trading lessons",
    icon: "book",
    target: 5,
    rarity: "common",
  },
  {
    id: "lessons_10",
    category: "lessons",
    title: "Swing Trader 📊",
    description: "Complete 10 trading lessons",
    icon: "book",
    target: 10,
    rarity: "rare",
  },
  {
    id: "lessons_25",
    category: "lessons",
    title: "Position Builder 🏦",
    description: "Complete 25 trading lessons",
    icon: "star",
    target: 25,
    rarity: "rare",
  },
  {
    id: "lessons_50",
    category: "lessons",
    title: "Fund Analyst 💎",
    description: "Complete 50 trading lessons",
    icon: "star",
    target: 50,
    rarity: "epic",
  },
  {
    id: "streak_3",
    category: "streak",
    title: "Green Candle Row 🕯️",
    description: "Reach a 3-day trading streak",
    icon: "flame",
    target: 3,
    rarity: "common",
  },
  {
    id: "streak_7",
    category: "streak",
    title: "Weekly Bull Run 🐂",
    description: "Reach a 7-day trading streak",
    icon: "flame",
    target: 7,
    rarity: "rare",
  },
  {
    id: "streak_14",
    category: "streak",
    title: "Breakout Trader 🚀",
    description: "Reach a 14-day trading streak",
    icon: "flame",
    target: 14,
    rarity: "rare",
  },
  {
    id: "streak_30",
    category: "streak",
    title: "Market Veteran 🎓",
    description: "Reach a 30-day trading streak",
    icon: "flame",
    target: 30,
    rarity: "epic",
  },
  {
    id: "streak_100",
    category: "streak",
    title: "Diamond Hands 💎",
    description: "Reach a 100-day trading streak",
    icon: "flame",
    target: 100,
    rarity: "legendary",
  },
  {
    id: "level_2",
    category: "level",
    title: "Paper Account Master 💰",
    description: "Reach trading level 2",
    icon: "zap",
    target: 2,
    rarity: "common",
  },
  {
    id: "level_3",
    category: "level",
    title: "Chart Whisperer 🔍",
    description: "Reach trading level 3",
    icon: "zap",
    target: 3,
    rarity: "rare",
  },
  {
    id: "level_4",
    category: "level",
    title: "Technical Guru 🖥️",
    description: "Reach trading level 4",
    icon: "zap",
    target: 4,
    rarity: "epic",
  },
  {
    id: "level_5",
    category: "level",
    title: "Arbitrage Master ⚙️",
    description: "Reach trading level 5",
    icon: "trophy",
    target: 5,
    rarity: "epic",
  },
  {
    id: "level_6",
    category: "level",
    title: "Wall Street Guru 👑",
    description: "Reach trading level 6",
    icon: "trophy",
    target: 6,
    rarity: "legendary",
  },
  {
    id: "first_module",
    category: "course",
    title: "Module Cleared 🟢",
    description: "Finish every lesson in a module",
    icon: "layers",
    target: 1,
    rarity: "common",
  },
  {
    id: "first_course",
    category: "course",
    title: "Licensed Trader 🎓",
    description: "Complete an entire trading course",
    icon: "graduation",
    target: 1,
    rarity: "epic",
  },
  {
    id: "first_note",
    category: "engagement",
    title: "Trading Journal 📝",
    description: "Save your first lesson note",
    icon: "pen",
    target: 1,
    rarity: "common",
  },
  {
    id: "notes_5",
    category: "engagement",
    title: "Journal Veteran 📔",
    description: "Save notes on 5 lessons",
    icon: "pen",
    target: 5,
    rarity: "rare",
  },
  {
    id: "first_bookmark",
    category: "engagement",
    title: "Ticker Alert 🔔",
    description: "Bookmark a lesson to watch again",
    icon: "bookmark",
    target: 1,
    rarity: "common",
  },
  {
    id: "first_quiz",
    category: "quiz",
    title: "Mock Trading Test 📝",
    description: "Pass your first lesson quiz",
    icon: "target",
    target: 1,
    rarity: "common",
  },
  {
    id: "perfect_quiz",
    category: "quiz",
    title: "Market Masterclass 🌟",
    description: "Score 100% on any quiz",
    icon: "target",
    target: 1,
    rarity: "epic",
  },
  {
    id: "time_60",
    category: "time",
    title: "Trading Hours ⏳",
    description: "Learn for 1 hour total",
    icon: "clock",
    target: 60,
    rarity: "common",
  },
  {
    id: "time_600",
    category: "time",
    title: "Market Veteran ⌛",
    description: "Learn for 10 hours total",
    icon: "clock",
    target: 600,
    rarity: "epic",
  },
  {
    id: "active_7_days",
    category: "streak",
    title: "Daily Trader 🗓️",
    description: "Learn on 7 different days",
    icon: "calendar",
    target: 7,
    rarity: "rare",
  },
];

export const STREAK_MILESTONES = [3, 7, 14, 30, 100] as const;

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  streak: "Streaks",
  lessons: "Lessons",
  level: "Levels",
  course: "Courses",
  engagement: "Engagement",
  quiz: "Quizzes",
  time: "Learning time",
};

function loadStore(userId: string): AchievementsStore {
  if (typeof window === "undefined") {
    return { unlocked: {}, pendingIds: [] };
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    if (!raw) return { unlocked: {}, pendingIds: [] };
    return JSON.parse(raw) as AchievementsStore;
  } catch {
    return { unlocked: {}, pendingIds: [] };
  }
}

function saveStore(userId: string, store: AchievementsStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(store));
}

function countNotes(userId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(`alvest_learn_notes:${userId}`);
    if (!raw) return 0;
    const notes = JSON.parse(raw) as Record<string, string>;
    return Object.values(notes).filter((n) => n.trim().length > 0).length;
  } catch {
    return 0;
  }
}

function countDistinctActiveDays(userId: string): number {
  const days = new Set<string>();
  for (const course of COURSE_CATALOG) {
    const progress = loadCourseProgress(userId, course.id);
    for (const entry of Object.values(progress)) {
      if (entry.completed && entry.completedAt) {
        days.add(entry.completedAt.slice(0, 10));
      }
    }
  }
  const gamification = loadGamification(userId);
  if (gamification.lastActiveDate) days.add(gamification.lastActiveDate);
  return days.size;
}

function countModulesCompleted(userId: string): number {
  let total = 0;
  for (const course of COURSE_CATALOG) {
    const progress = loadCourseProgress(userId, course.id);
    for (const mod of course.modules) {
      const lessonIds = mod.lessons.map((l) => l.id);
      const stats = countCompletedLessons(progress, lessonIds);
      if (stats.total > 0 && stats.completed === stats.total) total += 1;
    }
  }
  return total;
}

function countCoursesCompleted(userId: string): number {
  let total = 0;
  for (const course of COURSE_CATALOG) {
    const progress = loadCourseProgress(userId, course.id);
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const stats = countCompletedLessons(progress, lessonIds);
    if (stats.total > 0 && stats.completed === stats.total) total += 1;
  }
  return total;
}

function countLessonsCompleted(userId: string): number {
  let total = 0;
  for (const course of COURSE_CATALOG) {
    const progress = loadCourseProgress(userId, course.id);
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    total += countCompletedLessons(progress, lessonIds).completed;
  }
  return total;
}

function getMetricValue(userId: string, def: AchievementDef): number {
  const gamification = loadGamification(userId);
  const level = getLevelInfo(gamification.xp);
  const quizHistory = getQuizHistory(userId);
  const quizStats = getQuizStats(userId);

  switch (def.id) {
    case "first_lesson":
    case "lessons_5":
    case "lessons_10":
    case "lessons_25":
    case "lessons_50":
      return countLessonsCompleted(userId);
    case "streak_3":
    case "streak_7":
    case "streak_14":
    case "streak_30":
    case "streak_100":
      return gamification.longestStreak;
    case "level_2":
    case "level_3":
    case "level_4":
    case "level_5":
    case "level_6":
      return level.level;
    case "first_module":
      return countModulesCompleted(userId);
    case "first_course":
      return countCoursesCompleted(userId);
    case "first_note":
    case "notes_5":
      return countNotes(userId);
    case "first_bookmark":
      return getBookmarks(userId).length;
    case "first_quiz":
      return quizStats.attempts > 0 && quizHistory.some((q) => q.passed) ? 1 : 0;
    case "perfect_quiz":
      return quizHistory.some((q) => q.maxScore > 0 && q.score === q.maxScore) ? 1 : 0;
    case "time_60":
    case "time_600":
      return getTotalMinutesLearned(userId);
    case "active_7_days":
      return countDistinctActiveDays(userId);
    default:
      return 0;
  }
}

function isAchievementMet(userId: string, def: AchievementDef): boolean {
  return getMetricValue(userId, def) >= def.target;
}

/** Sync unlock state and return newly unlocked achievement ids. */
export function syncAchievements(userId: string): string[] {
  const store = loadStore(userId);
  const newlyUnlocked: string[] = [];
  const now = new Date().toISOString();

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    if (store.unlocked[def.id]) continue;
    if (!isAchievementMet(userId, def)) continue;
    store.unlocked[def.id] = now;
    newlyUnlocked.push(def.id);
    if (!store.pendingIds.includes(def.id)) {
      store.pendingIds.push(def.id);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveStore(userId, store);
  }

  return newlyUnlocked;
}

export function dismissAchievementNotifications(userId: string) {
  const store = loadStore(userId);
  if (store.pendingIds.length === 0) return;
  saveStore(userId, { ...store, pendingIds: [] });
}

export function getAchievementsSnapshot(userId: string): AchievementsSnapshot {
  syncAchievements(userId);
  const store = loadStore(userId);

  const achievements: AchievementProgress[] = ACHIEVEMENT_DEFINITIONS.map((def) => {
    const current = getMetricValue(userId, def);
    const unlockedAt = store.unlocked[def.id] ?? null;
    const unlocked = !!unlockedAt;
    const percent = Math.min(100, Math.round((current / def.target) * 100));
    return { def, unlocked, unlockedAt, current, target: def.target, percent };
  });

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const recentUnlocks = achievements
    .filter((a) => a.unlocked && a.unlockedAt)
    .sort((a, b) => (b.unlockedAt! > a.unlockedAt! ? 1 : -1))
    .slice(0, 5);

  const pendingNotifications = achievements.filter((a) =>
    store.pendingIds.includes(a.def.id),
  );

  return {
    achievements,
    unlockedCount,
    totalCount: achievements.length,
    recentUnlocks,
    pendingNotifications,
  };
}

export function getNextStreakMilestone(longestStreak: number): {
  next: number | null;
  previous: number;
  progress: number;
} {
  const previous =
    [...STREAK_MILESTONES].reverse().find((m) => longestStreak >= m) ?? 0;
  const next = STREAK_MILESTONES.find((m) => longestStreak < m) ?? null;

  if (!next) {
    return { next: null, previous, progress: 100 };
  }

  const span = next - previous;
  const progress = span > 0 ? Math.round(((longestStreak - previous) / span) * 100) : 0;
  return { next, previous, progress: Math.min(100, Math.max(0, progress)) };
}
