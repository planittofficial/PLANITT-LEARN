"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock,
  FileText,
  Lock,
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
import { alvestCheckoutUrl } from "@/constants/urls";
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
    setExpandedModules([]);
  }, [courseId]);

  useEffect(() => {
    if (!course.modules.length) return;
    if (progressLoading && enrolled) return;

    setExpandedModules((prev) => {
      if (prev.length > 0) return prev;

      const unlocked = course.modules
        .filter((_, moduleIndex) => {
          if (moduleIndex === 0) return true;
          const prevModule = course.modules[moduleIndex - 1];
          const prevIds = prevModule.lessons.map((lesson) => lesson.id);
          const prevStats = getModuleProgressStats(progress, prevIds);
          return prevStats.total > 0 && prevStats.completed === prevStats.total;
        })
        .map((module) => module.id);

      return unlocked.length > 0 ? unlocked : [course.modules[0].id];
    });
  }, [course.modules, courseId, enrolled, progress, progressLoading]);

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
            href={alvestCheckoutUrl(courseId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground transition hover:bg-brandHover"
          >
            Get this course on Alvest →
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
      <div className="space-y-6 relative">
        <h2 className="text-lg font-semibold">
          Course content
          <span className="ml-2 text-sm font-normal text-textMuted">
            {course.modules.length} modules
          </span>
        </h2>

        {/* Vertical Connector Line */}
        <div className="absolute left-6 top-16 bottom-8 w-0.5 learning-path-line hidden md:block" />

        {course.modules.length === 0 ? (
          <NoLessonsEmpty />
        ) : (
          course.modules.map((module, moduleIndex) => {
            const moduleLessonIds = module.lessons.map((l) => l.id);
            const moduleStats = getModuleProgressStats(progress, moduleLessonIds);
            const isExpanded = expandedModules.includes(module.id);

            // Determine completed, current, and locked states
            const isCompleted = moduleStats.total > 0 && moduleStats.completed === moduleStats.total;
            let isCurrent = false;
            let isLocked = false;

            if (!isCompleted) {
              if (moduleIndex === 0) {
                isCurrent = true;
              } else {
                const prevModule = course.modules[moduleIndex - 1];
                const prevModuleLessonIds = prevModule.lessons.map((l) => l.id);
                const prevModuleStats = getModuleProgressStats(progress, prevModuleLessonIds);
                const prevCompleted = prevModuleStats.total > 0 && prevModuleStats.completed === prevModuleStats.total;
                if (prevCompleted) {
                  isCurrent = true;
                } else {
                  isLocked = true;
                }
              }
            }

            return (
              <div key={module.id} className="relative group">
                {/* Connector timeline dots */}
                {isCompleted && (
                  <div className="hidden md:flex absolute left-6 top-[28px] -translate-x-1/2 w-4 h-4 rounded-full bg-brand z-10 border-4 border-appBase" />
                )}
                {isCurrent && (
                  <div className="hidden md:flex absolute left-6 top-[24px] -translate-x-1/2 w-6 h-6 rounded-full bg-brand z-10 border-4 border-appBase animate-pulse shadow-[0_0_15px_rgba(20,184,166,0.5)]" />
                )}
                {isLocked && (
                  <div className="hidden md:flex absolute left-6 top-[28px] -translate-x-1/2 w-4 h-4 rounded-full bg-borderSubtle z-10 border-4 border-appBase" />
                )}

                <section
                  className={cn(
                    "overflow-hidden rounded-xl border md:ml-16 transition-all duration-300",
                    isCurrent
                      ? "border-brand bg-elevated shadow-lg"
                      : isLocked
                        ? "border-borderSubtle bg-surface/40 opacity-60 grayscale-[0.3]"
                        : "border-borderSubtle bg-surface hover:border-brand/40"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => !isLocked && toggleModule(module.id)}
                    className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-overlay-faint"
                    disabled={isLocked}
                  >
                    <span className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                      isCompleted ? "bg-brand/10 text-brand" : isCurrent ? "bg-brand text-brandForeground" : "bg-overlay-medium text-textMuted"
                    )}>
                      {moduleIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-textPrimary">{module.title}</h3>
                        {isCompleted && (
                          <span className="flex items-center gap-1 bg-brand/10 text-brand px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                            COMPLETED
                          </span>
                        )}
                        {isCurrent && (
                          <span className="flex items-center gap-1 bg-brand text-brandForeground px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                            CURRENT
                          </span>
                        )}
                        {isLocked && (
                          <span className="flex items-center gap-1 bg-overlay-medium text-textMuted px-2 py-0.5 rounded text-[9px] font-bold font-mono">
                            <Lock className="h-2.5 w-2.5" /> LOCKED
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-textSecondary">{module.summary}</p>
                      
                      {!isLocked && (
                        <div className="mt-3 max-w-xs">
                          <ProgressBar value={moduleStats.percent} size="sm" />
                        </div>
                      )}
                    </div>
                    
                    {!isLocked && (
                      isExpanded ? (
                        <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-textMuted" />
                      ) : (
                        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-textMuted" />
                      )
                    )}
                  </button>

                  {isExpanded && !isLocked ? (
                    <ul className="border-t border-borderSubtle/50 px-3 py-2 sm:px-5 bg-surface/50">
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
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-brand" />
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
                            className="inline-flex w-full items-center justify-center rounded bg-brand/10 border border-brand/35 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/15"
                          >
                            Take module test →
                          </Link>
                        </li>
                      ) : null}
                    </ul>
                  ) : null}
                </section>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
