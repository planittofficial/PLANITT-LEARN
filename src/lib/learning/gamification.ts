const STORAGE_KEY = "alvest_learn_gamification";
const XP_PER_LESSON = 50;
const XP_PER_STREAK_BONUS = 10;

export type GamificationState = {
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  lessonsCompletedTotal: number;
};

const LEVELS = [
  { level: 1, title: "Paper Trader", minXp: 0 },
  { level: 2, title: "Market Intern", minXp: 100 },
  { level: 3, title: "Stock Explorer", minXp: 300 },
  { level: 4, title: "Trend Rider", minXp: 600 },
  { level: 5, title: "Alpha Wizard", minXp: 1000 },
  { level: 6, title: "Hedge Fund Legend", minXp: 2000 },
];

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function loadGamification(userId: string): GamificationState {
  if (typeof window === "undefined") {
    return { xp: 0, streak: 0, longestStreak: 0, lastActiveDate: null, lessonsCompletedTotal: 0 };
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    if (!raw) {
      return { xp: 0, streak: 0, longestStreak: 0, lastActiveDate: null, lessonsCompletedTotal: 0 };
    }
    return JSON.parse(raw) as GamificationState;
  } catch {
    return { xp: 0, streak: 0, longestStreak: 0, lastActiveDate: null, lessonsCompletedTotal: 0 };
  }
}

function saveGamification(userId: string, state: GamificationState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(state));
}

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1] ?? null;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
      break;
    }
  }
  const progressToNext = next
    ? Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100;
  return {
    ...current,
    nextLevel: next?.level ?? null,
    nextMinXp: next?.minXp ?? null,
    nextTitle: next?.title ?? null,
    progressToNext,
    xpIntoLevel: xp - current.minXp,
    xpForLevel: next ? next.minXp - current.minXp : 0,
  };
}

/** Call when a lesson is completed or significant learning activity occurs. */
export function recordLearningActivity(userId: string): GamificationState {
  const state = loadGamification(userId);
  const today = todayKey();

  let streak = state.streak;
  if (state.lastActiveDate === today) {
    // same day — no streak change
  } else if (state.lastActiveDate === yesterdayKey()) {
    streak += 1;
  } else {
    streak = 1;
  }

  const xpGain = XP_PER_LESSON + (streak > 1 ? XP_PER_STREAK_BONUS : 0);
  const next: GamificationState = {
    xp: state.xp + xpGain,
    streak,
    longestStreak: Math.max(state.longestStreak, streak),
    lastActiveDate: today,
    lessonsCompletedTotal: state.lessonsCompletedTotal + 1,
  };
  saveGamification(userId, next);
  return next;
}

/** Touch activity without XP (e.g. opening a lesson). Updates streak date only. */
export function touchDailyActivity(userId: string): GamificationState {
  const state = loadGamification(userId);
  const today = todayKey();
  if (state.lastActiveDate === today) return state;

  let streak = state.streak;
  if (state.lastActiveDate === yesterdayKey()) streak += 1;
  else if (state.lastActiveDate !== today) streak = Math.max(streak, 1);

  const next = { ...state, streak, lastActiveDate: today, longestStreak: Math.max(state.longestStreak, streak) };
  saveGamification(userId, next);
  return next;
}
