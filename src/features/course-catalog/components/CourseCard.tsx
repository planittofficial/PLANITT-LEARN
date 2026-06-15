"use client";

import Link from "next/link";
import { BookOpen, Lock } from "lucide-react";

import { ROUTES } from "@/constants/routes";
import type { CourseDefinition } from "@/lib/catalog/courses";
import { countCourseLessons } from "@/lib/catalog/courses";
import { cn } from "@/lib/utils";

const LEVEL_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-500/15 text-emerald-400",
  Intermediate: "bg-amber-500/15 text-amber-400",
  Advanced: "bg-rose-500/15 text-rose-400",
};

const CATEGORY_STYLES: Record<string, string> = {
  "Indian Stocks": "bg-brand/15 text-brand",
  Forex: "bg-sky-500/15 text-sky-400",
  "F&O": "bg-violet-500/15 text-violet-400",
  Crypto: "bg-yellow-500/15 text-yellow-400",
  Psychology: "bg-rose-500/15 text-rose-300",
  "Algo Trading": "bg-indigo-500/15 text-indigo-400",
};

type CourseCardProps = {
  course: CourseDefinition;
  enrolled: boolean;
  progressPercent?: number;
  completedLessons?: number;
  totalLessons?: number;
  preview?: boolean;
};

export function CourseCard({ course, enrolled, progressPercent, completedLessons, totalLessons
  , preview }: CourseCardProps) {
  const moduleCount = course.modules.length;
  const lessonCount = countCourseLessons(course);
  const levelClass = LEVEL_STYLES[course.level] ?? "bg-white/10 text-textSecondary";
  const categoryClass = CATEGORY_STYLES[course.category] ?? "bg-brand/15 text-brand";

  const inner = (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border bg-surface p-5 transition",
        enrolled
          ? "border-brand/30 hover:border-brand hover:-translate-y-1"
          : "border-borderSubtle opacity-90 hover:opacity-100",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", categoryClass)}>
          {course.category}
        </span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", levelClass)}>
          {course.level}
        </span>
        {!enrolled ? (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-textMuted">
            <Lock className="h-3.5 w-3.5" />
            Locked
          </span>
        ) : (
          <BookOpen className="ml-auto h-5 w-5 shrink-0 text-brand" />
        )}
      </div>

<div className="mt-3 flex items-center justify-between">
  <h3 className="text-lg font-semibold leading-snug">
    {course.title}
  </h3>

  {enrolled ? (
    progressPercent === 100 ? (
      <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-400">
        Completed
      </span>
    ) : (
      <span className="rounded-full bg-brand/15 px-2 py-1 text-xs font-medium text-brand">
        In Progress
      </span>
    )
  ) : (
    <span className="rounded-full bg-white/5 px-2 py-1 text-xs font-medium text-textMuted">
      Locked
    </span>
  )}
</div>      <p className="mt-2 line-clamp-2 text-sm text-textSecondary">{course.blurb}</p>

      <p className="mt-3 text-xs text-textMuted">
        Duration: {course.duration} · Modules: {moduleCount} · Lessons: {lessonCount}
      </p>

      <ul className="mt-4 flex-1 space-y-1.5 text-sm text-textSecondary">
        {course.outcomes.slice(0, 3).map((outcome) => (
          <li key={outcome} className="flex gap-2">
            <span className="text-brand">•</span>
            <span className="line-clamp-2">{outcome}</span>
          </li>
        ))}
      </ul>

      {enrolled && progressPercent !== undefined ? (
        <div className="mt-4 rounded-lg bg-black/20 p-3">
          <div className="mb-1 flex justify-between text-xs text-textMuted">
  <span>Progress</span>
  <span>{progressPercent}% Complete</span>
</div>

<div className="mb-2 text-xs text-textMuted">
  {completedLessons}/{totalLessons} lessons completed
</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-borderSubtle">
            <div className="h-full bg-brand transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        {enrolled ? (
<span
  className="
    inline-flex
    w-full
    items-center
    justify-center
    rounded-lg
    bg-brand
    px-4
    py-2.5
    text-sm
    font-semibold
    text-black
    transition
    hover:opacity-90
  "
>            {progressPercent && progressPercent > 0
 ? "Resume Course →"
 : "Start Learning →"}
          </span>
        ) : (
          <span className="inline-flex w-full items-center justify-center rounded-lg border border-dashed border-borderSubtle px-4 py-2.5 text-sm text-textMuted">
            Enroll on Planitt to unlock
          </span>
        )}
      </div>
    </article>
  );

  if (enrolled && !preview) {
    return (
      <Link href={ROUTES.STUDENT.course(course.id)} className="block h-full">
        {inner}
      </Link>
    );
  }

  return inner;
}
