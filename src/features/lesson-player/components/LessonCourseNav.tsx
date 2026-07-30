"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  FileText,
  Play,
  Video,
} from "lucide-react";
import { useState } from "react";

import { ROUTES } from "@/constants/routes";
import type { CourseDefinition } from "@/lib/catalog/courses";
import { getModuleProgressStats } from "@/lib/learning/course-progress";
import type { CourseProgress } from "@/lib/learning/progress";
import { cn } from "@/lib/utils";

const KIND_ICONS = { video: Video, article: FileText, external: Play } as const;

type LessonCourseNavProps = {
  course: CourseDefinition;
  courseId: string;
  currentLessonId: string;
  progress: CourseProgress;
};

export function LessonCourseNav({
  course,
  courseId,
  currentLessonId,
  progress,
}: LessonCourseNavProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    const currentModule = course.modules.find((m) =>
      m.lessons.some((l) => l.id === currentLessonId),
    );
    return new Set(currentModule ? [currentModule.id] : course.modules.slice(0, 1).map((m) => m.id));
  });

  const toggle = (moduleId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = course.modules.reduce(
    (s, m) => s + m.lessons.filter((l) => progress[l.id]?.completed).length,
    0,
  );
  const coursePercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="rounded-lg border border-borderSubtle bg-surface/60 backdrop-blur-md shadow-2xl">
      <div className="border-b border-borderSubtle p-4">
        <p className="font-mono text-[9px] uppercase tracking-widest text-brand">COURSE_PROGRESS</p>
        <p className="mt-1 font-headline text-sm font-extrabold text-textPrimary leading-snug tracking-tight">{course.title}</p>
        <div className="mt-3">
          <div className="w-full h-1 bg-elevated rounded overflow-hidden">
            <div className="h-full bg-brand transition-all duration-500" style={{ width: `${coursePercent}%` }} />
          </div>
          <div className="flex justify-between font-mono text-[9px] text-textMuted mt-1">
            <span>{coursePercent}% complete</span>
            <span>{completedCount}/{totalLessons} nodes</span>
          </div>
        </div>
      </div>

      <div className="max-h-[440px] overflow-y-auto p-2 terminal-scroll">
        {course.modules.map((mod, modIndex) => {
          const lessonIds = mod.lessons.map((l) => l.id);
          const modStats = getModuleProgressStats(progress, lessonIds);
          const isOpen = expanded.has(mod.id);

          return (
            <div key={mod.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(mod.id)}
                className="flex w-full items-center gap-2 rounded px-2 py-2.5 text-left text-xs transition hover:bg-overlay-hover font-mono"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-brand/10 text-[10px] font-bold text-brand border border-brand/20">
                  {modIndex + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-textPrimary uppercase tracking-tight">{mod.title}</span>
                <span className="shrink-0 text-[10px] text-textMuted">
                  {modStats.completed}/{modStats.total}
                </span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-textMuted" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-textMuted" />
                )}
              </button>

              {isOpen ? (
                <ul className="ml-2 border-l border-borderSubtle pl-2">
                  {mod.lessons.map((lesson) => {
                    const done = progress[lesson.id]?.completed;
                    const active = lesson.id === currentLessonId;
                    const Icon = KIND_ICONS[lesson.kind] ?? FileText;

                    return (
                      <li key={lesson.id} className="mb-0.5">
                        <Link
                          href={ROUTES.STUDENT.lesson(courseId, mod.id, lesson.id)}
                          className={cn(
                            "group flex items-center gap-2 rounded px-2 py-2 font-mono text-[11px] uppercase tracking-wide transition border border-transparent",
                            active
                              ? "bg-brand/5 border-l-2 border-l-brand text-brand font-bold"
                              : "text-textSecondary hover:text-textPrimary hover:bg-overlay-hover",
                          )}
                        >
                          {done ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand" />
                          ) : (
                            <Circle
                              className={cn(
                                "h-3.5 w-3.5 shrink-0",
                                active ? "text-brand" : "text-textMuted group-hover:text-brand",
                              )}
                            />
                          )}
                          <Icon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                          <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
