"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  Play,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { CoursePageSkeleton } from "@/components/ui/skeletons";
import { LockedCourseEmpty, NoLessonsEmpty } from "@/components/shared/EmptyState";
import { NextLessonCTA } from "@/features/course-catalog/components/NextLessonCTA";
import { ROUTES } from "@/constants/routes";
import { planittCheckoutUrl } from "@/constants/urls";
import { useCourseProgress } from "@/hooks/progress/use-course-progress";
import {
  courseCoverSrc,
  courseIcon,
  courseThumbnailClass,
} from "@/lib/catalog/course-visuals";
import type { CourseDefinition } from "@/lib/catalog/courses";
import { getModuleProgressStats, getCourseProgressStats } from "@/lib/learning/course-progress";
import { cn } from "@/lib/utils";

const LESSON_ICONS = {
  video: Video,
  article: FileText,
  external: Play,
} as const;

type CourseHubViewProps = {
  course: CourseDefinition;
  courseId: string;
  userId?: string;
  enrolled: boolean;
};

export function CourseHubView({
  course,
  courseId,
  userId,
  enrolled,
}: CourseHubViewProps) {
  const { progress, isLoading: progressLoading } = useCourseProgress(courseId);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    if (course.modules.length) {
      setExpandedModules([course.modules[0].id]);
    }
  }, [course.modules]);

  const stats = useMemo(
    () => getCourseProgressStats(userId, course, progress),
    [userId, course, progress],
  );
  const coverSrc = courseCoverSrc(course.category);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId],
    );
  };

  if (progressLoading && enrolled) {
    return <CoursePageSkeleton />;
  }

  if (!enrolled) {
    return (
      <LockedCourseEmpty
        action={
          <a
            href={planittCheckoutUrl(courseId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground transition hover:bg-brandHover dark:text-black dark:hover:brightness-110"
          >
            Get this course on Planitt →
          </a>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Course hero */}
      <div className="relative overflow-hidden rounded-2xl border border-borderSubtle">
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-50"
            draggable={false}
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-40",
              courseThumbnailClass(course.category),
            )}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/85 to-surface/55" />
        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:p-8">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-overlay-medium text-4xl shadow-lg ring-1 ring-white/10 backdrop-blur-sm">
            {coverSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverSrc} alt="" className="h-full w-full object-cover" draggable={false} />
            ) : (
              courseIcon(course.category)
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge variant="brand">{course.category}</Badge>
              <Badge>{course.level}</Badge>
              <Badge>{course.duration}</Badge>
            </div>
            <h1 className="mt-3 text-2xl font-bold sm:text-3xl">{course.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-textSecondary">
              {course.blurb}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-3xl font-bold text-brand">{stats.percent}%</p>
            <p className="text-xs text-textMuted">complete</p>
          </div>
        </div>
        <div className="relative border-t border-borderSubtle/50 bg-surface/80 px-6 py-4 backdrop-blur-sm sm:px-8">
          <ProgressBar
            value={stats.percent}
            showLabel
            label={`${stats.completed}/${stats.total} lessons completed`}
          />
        </div>
      </div>

      <NextLessonCTA
        course={course}
        courseId={courseId}
        userId={userId}
        progress={progress}
        stats={stats}
      />

      {/* Learning outcomes */}
      {course.outcomes.length > 0 ? (
        <section className="rounded-2xl border border-borderSubtle bg-surface/60 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand">
            What you&apos;ll learn
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {course.outcomes.map((outcome) => (
              <li
                key={outcome}
                className="flex items-start gap-2 text-sm text-textSecondary"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                {outcome}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Modules */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Course content
          <span className="ml-2 text-sm font-normal text-textMuted">
            {course.modules.length} modules
          </span>
        </h2>

        {course.modules.length === 0 ? (
          <NoLessonsEmpty />
        ) : (
          course.modules.map((module, moduleIndex) => {
            const moduleLessonIds = module.lessons.map((l) => l.id);
            const moduleStats = getModuleProgressStats(progress, moduleLessonIds);
            const isExpanded = expandedModules.includes(module.id);

            return (
              <section
                key={module.id}
                className="overflow-hidden rounded-xl border border-borderSubtle bg-surface transition-colors hover:border-borderSubtle/80"
              >
                <button
                  type="button"
                  onClick={() => toggleModule(module.id)}
                  className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-overlay-faint"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
                    {moduleIndex + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-textPrimary">{module.title}</h3>
                      <span className="text-xs text-textMuted">
                        {moduleStats.completed}/{moduleStats.total} done
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-textSecondary">{module.summary}</p>
                    <div className="mt-3 max-w-xs">
                      <ProgressBar value={moduleStats.percent} size="sm" />
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-textMuted" />
                  ) : (
                    <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-textMuted" />
                  )}
                </button>

                {isExpanded ? (
                  <ul className="border-t border-borderSubtle/50 px-3 py-2 sm:px-5">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const done = progress[lesson.id]?.completed;
                      const Icon = LESSON_ICONS[lesson.kind] ?? FileText;

                      return (
                        <li key={lesson.id}>
                          <Link
                            href={ROUTES.STUDENT.lesson(courseId, module.id, lesson.id)}
                            className="group flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-overlay-hover"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xs text-textMuted">
                              {lessonIndex + 1}
                            </span>
                            {done ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                            ) : (
                              <Circle className="h-5 w-5 shrink-0 text-textMuted group-hover:text-brand" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-textPrimary group-hover:text-brand">
                                {lesson.title}
                              </p>
                              <p className="truncate text-xs text-textMuted">{lesson.summary}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 text-xs text-textMuted">
                              <Icon className="h-3.5 w-3.5" />
                              <Clock className="h-3.5 w-3.5" />
                              {lesson.durationMinutes}m
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                    {moduleStats.total > 0 && moduleStats.completed === moduleStats.total ? (
                      <li className="px-3 pb-3 pt-2">
                        <Link
                          href={ROUTES.STUDENT.moduleTest(courseId, module.id)}
                          className="inline-flex w-full items-center justify-center rounded-xl border border-brand/30 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition hover:border-brand/40 hover:bg-brand/15"
                        >
                          Take module test →
                        </Link>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
