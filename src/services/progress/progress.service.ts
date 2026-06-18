import { DEFAULT_MIN_WATCH_PERCENT } from "@/constants/progress";
import { prisma } from "@/lib/db/prisma";
import { getDatabaseUrl } from "@/lib/env";
import { getLessonContext } from "@/services/courses/lesson.service";
import type { LessonProgressState, WatchHeartbeatResult } from "@/types/progress.types";

export class ProgressError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "ProgressError";
    this.status = status;
  }
}

export async function getLessonProgress(
  userId: string,
  lessonId: string,
): Promise<LessonProgressState | null> {
  if (!getDatabaseUrl()) return null;

  const row = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  if (!row) return null;

  return {
    lessonId: row.lessonId,
    watchedSeconds: row.watchedSeconds,
    watchPercent: row.watchPercent,
    completed: row.completed,
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

/**
 * Record video watch position and apply the 75% completion rule server-side.
 */
export async function recordWatchHeartbeat(
  userId: string,
  lessonId: string,
  watchedSeconds: number,
  durationSeconds: number,
): Promise<WatchHeartbeatResult> {
  if (!getDatabaseUrl()) {
    throw new ProgressError("Progress tracking requires DATABASE_URL", 503);
  }

  const ctx = await getLessonContext(lessonId);
  if (!ctx) throw new ProgressError("Lesson not found", 404);

  const duration =
    durationSeconds > 0
      ? durationSeconds
      : (ctx.lesson.durationMinutes > 0 ? ctx.lesson.durationMinutes * 60 : 0);

  if (duration <= 0) throw new ProgressError("Invalid video duration", 400);

  const watchPercent = Math.min(100, Math.round((watchedSeconds / duration) * 1000) / 10);
  const minWatchPercent = ctx.lesson.minWatchPercent || DEFAULT_MIN_WATCH_PERCENT;
  const completed = watchPercent >= minWatchPercent;

  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });

  const now = new Date();
  const row = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    create: {
      userId,
      lessonId,
      watchedSeconds: Math.floor(watchedSeconds),
      watchPercent,
      completed,
      completedAt: completed ? now : null,
      lastWatchedAt: now,
    },
    update: {
      watchedSeconds: Math.max(existing?.watchedSeconds ?? 0, Math.floor(watchedSeconds)),
      watchPercent: Math.max(existing?.watchPercent ?? 0, watchPercent),
      completed: existing?.completed || completed,
      completedAt: existing?.completedAt ?? (completed ? now : null),
      lastWatchedAt: now,
    },
  });

  return {
    watchedSeconds: row.watchedSeconds,
    watchPercent: row.watchPercent,
    completed: row.completed,
    minWatchPercent,
  };
}
