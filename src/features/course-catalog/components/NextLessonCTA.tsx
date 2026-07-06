"use client";

import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { CourseDefinition } from "@/lib/catalog/courses";
import { getContinueLessonUrl } from "@/lib/learning/course-progress";
import type { CourseProgress } from "@/lib/learning/progress";

type NextLessonCTAProps = {
  course: CourseDefinition;
  courseId: string;
  userId?: string;
  progress: CourseProgress;
  stats: { percent: number; completed: number; total: number };
};

export function NextLessonCTA({
  course,
  courseId,
  userId,
  progress,
  stats,
}: NextLessonCTAProps) {
  const continueUrl = userId ? getContinueLessonUrl(userId, course, progress) : null;

  // Find first incomplete lesson for label
  let nextTitle = "Start your first lesson";
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!progress[lesson.id]?.completed) {
        nextTitle = lesson.title;
        break;
      }
    }
    if (nextTitle !== "Start your first lesson") break;
  }

  if (!continueUrl) return null;

  const isNew = stats.percent === 0;
  const isComplete = stats.percent === 100;

  if (isComplete) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-emerald-300">Course complete!</p>
            <p className="text-sm text-textSecondary">You finished all {stats.total} lessons.</p>
          </div>
        </div>
        <Link
          href={continueUrl}
          className="shrink-0 rounded-xl border border-emerald-500/30 px-4 py-2.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/10"
        >
          Review
        </Link>
      </div>
    );
  }

  return (
    <Link
      href={continueUrl}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-gradient-to-r from-brand/15 to-brand/5 p-5 transition hover:border-brand/50 hover:shadow-lg hover:shadow-brand/10"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-brandForeground shadow-lg shadow-brand/20 transition group-hover:scale-105 dark:text-black">
          {isNew ? <Sparkles className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current" />}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand">
            {isNew ? "Ready to begin?" : "Up next"}
          </p>
          <p className="mt-0.5 font-semibold text-textPrimary group-hover:text-brand transition-colors">
            {nextTitle}
          </p>
          <p className="mt-1 text-xs text-textMuted">
            {stats.completed}/{stats.total} lessons · {stats.percent}% complete
          </p>
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brandForeground transition group-hover:bg-brandHover dark:text-black dark:group-hover:brightness-110">
        {isNew ? "Start" : "Resume"}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
