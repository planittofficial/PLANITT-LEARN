import type { CourseDefinition } from "@/lib/catalog/courses";
import { ROUTES } from "@/constants/routes";

import {
  countCompletedLessons,
  loadCourseProgress,
  type CourseProgress,
} from "./progress";

export type CourseProgressStats = {
  completed: number;
  total: number;
  percent: number;
};

export function getCourseProgressStats(
  userId: string | undefined,
  course: CourseDefinition,
): CourseProgressStats {
  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  if (!userId || lessonIds.length === 0) {
    return { completed: 0, total: lessonIds.length, percent: 0 };
  }
  const progress = loadCourseProgress(userId, course.id);
  const stats = countCompletedLessons(progress, lessonIds);
  const percent =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  return { ...stats, percent };
}

export function getModuleProgressStats(
  progress: CourseProgress,
  lessonIds: string[],
): CourseProgressStats {
  const stats = countCompletedLessons(progress, lessonIds);
  const percent =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  return { ...stats, percent };
}

/** First incomplete lesson, or first lesson if none started. */
export function getContinueLessonUrl(
  userId: string | undefined,
  course: CourseDefinition,
): string | null {
  if (!course.modules.length) return null;

  const progress = userId ? loadCourseProgress(userId, course.id) : {};

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!progress[lesson.id]?.completed) {
        return ROUTES.STUDENT.lesson(course.id, mod.id, lesson.id);
      }
    }
  }

  const first = course.modules[0]?.lessons[0];
  if (!first) return ROUTES.STUDENT.course(course.id);
  return ROUTES.STUDENT.lesson(course.id, course.modules[0].id, first.id);
}
