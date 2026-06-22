import { COURSE_CATALOG } from "@/lib/catalog/courses";

import { loadCourseProgress } from "./progress";

const RECENT_KEY = "planitt_learn_recent";
const MAX_RECENT = 8;

export type RecentLesson = {
  courseId: string;
  courseTitle: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  kind: string;
  watchedAt: string;
};

export function recordRecentlyWatched(
  userId: string,
  entry: Omit<RecentLesson, "watchedAt">,
): RecentLesson[] {
  if (typeof window === "undefined") return [];
  const key = `${RECENT_KEY}:${userId}`;
  const item: RecentLesson = { ...entry, watchedAt: new Date().toISOString() };
  try {
    const raw = window.localStorage.getItem(key);
    const list: RecentLesson[] = raw ? (JSON.parse(raw) as RecentLesson[]) : [];
    const filtered = list.filter((r) => r.lessonId !== entry.lessonId);
    const next = [item, ...filtered].slice(0, MAX_RECENT);
    window.localStorage.setItem(key, JSON.stringify(next));
    return next;
  } catch {
    return [item];
  }
}

export function getRecentlyWatched(userId: string, limit = 5): RecentLesson[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${RECENT_KEY}:${userId}`);
    if (!raw) return [];
    return (JSON.parse(raw) as RecentLesson[]).slice(0, limit);
  } catch {
    return [];
  }
}

export type WeeklyDay = {
  label: string;
  date: string;
  lessonsCompleted: number;
};

/** Count lesson completions per day for the last 7 days from local progress. */
export function getWeeklyActivity(userId: string): WeeklyDay[] {
  const dayMap = new Map<string, number>();
  const days: WeeklyDay[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    days.push({ label, date: key, lessonsCompleted: 0 });
    dayMap.set(key, days.length - 1);
  }

  for (const course of COURSE_CATALOG) {
    const progress = loadCourseProgress(userId, course.id);
    for (const entry of Object.values(progress)) {
      if (!entry.completed || !entry.completedAt) continue;
      const dateKey = entry.completedAt.slice(0, 10);
      const idx = dayMap.get(dateKey);
      if (idx !== undefined) days[idx].lessonsCompleted += 1;
    }
  }

  return days;
}

export function getTotalMinutesLearned(userId: string): number {
  let total = 0;
  for (const course of COURSE_CATALOG) {
    const progress = loadCourseProgress(userId, course.id);
    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (progress[lesson.id]?.completed) total += lesson.durationMinutes;
      }
    }
  }
  return total;
}
