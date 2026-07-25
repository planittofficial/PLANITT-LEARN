const STORAGE_PREFIX = "alvest_learn_progress";

export type LessonProgress = {
  completed: boolean;
  completedAt?: string;
};

export type CourseProgress = Record<string, LessonProgress>;

function storageKey(userId: string, courseId: string): string {
  return `${STORAGE_PREFIX}:${userId}:${courseId}`;
}

export function loadCourseProgress(userId: string, courseId: string): CourseProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(userId, courseId));
    if (!raw) return {};
    return JSON.parse(raw) as CourseProgress;
  } catch {
    return {};
  }
}

export function saveLessonComplete(userId: string, courseId: string, lessonId: string): CourseProgress {
  const next: CourseProgress = {
    ...loadCourseProgress(userId, courseId),
    [lessonId]: { completed: true, completedAt: new Date().toISOString() },
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(storageKey(userId, courseId), JSON.stringify(next));
  }
  return next;
}

export function countCompletedLessons(
  progress: CourseProgress,
  lessonIds: string[],
): { completed: number; total: number } {
  const total = lessonIds.length;
  const completed = lessonIds.filter((id) => progress[id]?.completed).length;
  return { completed, total };
}
