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

import { ProgressBar } from "@/components/ui/ProgressBar";
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
    <div className="rounded-xl border border-borderSubtle bg-surface">
      <div className="border-b border-borderSubtle p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-brand">Course progress</p>
        <p className="mt-1 text-sm font-semibold text-textPrimary">{course.title}</p>
        <div className="mt-3">
          <ProgressBar
            value={coursePercent}
            showLabel
            label={`${completedCount}/${totalLessons} lessons`}
            size="sm"
          />
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto p-2">
        {course.modules.map((mod, modIndex) => {
          const lessonIds = mod.lessons.map((l) => l.id);
          const modStats = getModuleProgressStats(progress, lessonIds);
          const isOpen = expanded.has(mod.id);

          return (
            <div key={mod.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(mod.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm transition hover:bg-overlay-hover"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand/10 text-xs font-bold text-brand">
                  {modIndex + 1}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-textPrimary">{mod.title}</span>
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
                <ul className="ml-2 border-l border-borderSubtle/50 pl-2">
                  {mod.lessons.map((lesson) => {
                    const done = progress[lesson.id]?.completed;
                    const active = lesson.id === currentLessonId;
                    const Icon = KIND_ICONS[lesson.kind] ?? FileText;

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={ROUTES.STUDENT.lesson(courseId, mod.id, lesson.id)}
                          className={cn(
                            "group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition",
                            active
                              ? "bg-brand/10 text-brand"
                              : "hover:bg-overlay-hover",
                          )}
                        >
                          {done ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          ) : (
                            <Circle
                              className={cn(
                                "h-4 w-4 shrink-0",
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
