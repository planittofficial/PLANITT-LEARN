"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { LearnShell } from "@/components/layout/student";
import { ROUTES } from "@/constants/routes";

import { useAuth } from "@/context/auth-context";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { getCourseById } from "@/lib/catalog/courses";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import {
  countCompletedLessons,
  loadCourseProgress,
  type CourseProgress,
} from "@/lib/learning/progress";
import { MAIN_WEBSITE_URL } from "@/lib/env";

export default function CourseHubPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const course = getCourseById(courseId);
  const { user } = useAuth();
  const { enrolledIds, loading } = useEnrollment();
  const [progress, setProgress] = useState<CourseProgress>({});
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
  if (!user?.id) return;
  setProgress(loadCourseProgress(user.id, courseId));
}, [courseId, user?.id]);

useEffect(() => {
  if (!course) return;

  setExpandedModules([course.modules[0]?.id]);
}, [course]);

const lessonIds = useMemo(
  () => course?.modules.flatMap((m) => m.lessons.map((l) => l.id)) ?? [],
  [course],
);

const stats = countCompletedLessons(progress, lessonIds);

const toggleModule = (moduleId: string) => {
  setExpandedModules((prev) =>
    prev.includes(moduleId)
      ? prev.filter((id) => id !== moduleId)
      : [...prev, moduleId]
  );
};

if (!course) notFound();

  if (loading) {
    return (
      <LearnShell>
        <p className="text-sm text-textSecondary">Loading course…</p>
      </LearnShell>
    );
  }

  if (!isEnrolledInCourse(enrolledIds, courseId)) {
    return (
      <LearnShell>
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="mt-4 text-sm text-textSecondary">
          You are not enrolled in this course. Purchase it on Planitt first.
        </p>
        <a
          href={`${MAIN_WEBSITE_URL}/learn`}
          className="mt-4 inline-block text-sm text-brand hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Go to checkout →
        </a>
      </LearnShell>
    );
  }

  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <LearnShell>
      <Link href={ROUTES.STUDENT.HOME} className="text-sm text-textMuted hover:text-brand">
        ← My courses
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{course.title}</h1>
      <p className="mt-2 text-sm text-textSecondary">{course.blurb}</p>

      <div className="mt-6">
        <div className="mb-1 flex justify-between text-xs text-textMuted">
          <span>Progress</span>
          <span>
            {stats.completed}/{stats.total} lessons · {pct}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-borderSubtle">
          <div className="h-full bg-brand transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {course.modules.length === 0 ? (
          <p className="rounded-xl border border-dashed border-borderSubtle p-6 text-sm text-textSecondary">
            Module content coming soon — interns add curriculum in{" "}
            <code className="text-brand">src/lib/catalog/courses.ts</code>.
          </p>
        ) : (
          course.modules.map((module) => {
  const moduleLessonIds = module.lessons.map((l) => l.id);

  const moduleStats = countCompletedLessons(
    progress,
    moduleLessonIds
  );

  const modulePct =
    moduleStats.total > 0
      ? Math.round(
          (moduleStats.completed / moduleStats.total) * 100
        )
      : 0;

  return (
    <section
      key={module.id}
      className="rounded-xl border border-borderSubtle bg-surface p-5"
    >
              <div className="flex items-center justify-between gap-4">
  <button
  type="button"
  onClick={() => toggleModule(module.id)}
  className="flex w-full items-center justify-between"
>
<h2 className="text-lg font-semibold text-textPrimary">    {module.title}
  </h2>

  {expandedModules.includes(module.id) ? (
    <ChevronDown className="h-4 w-4" />
  ) : (
    <ChevronRight className="h-4 w-4" />
  )}
</button>

  <span className="text-xs text-brand">
    {moduleStats.completed}/{moduleStats.total} lessons done
  </span>
</div>

<p className="mt-2 text-sm leading-relaxed text-textSecondary">
  {module.summary}
</p>

<div className="mt-3">
  <div className="mb-1 flex justify-between text-xs text-textMuted">
    <span>Module Progress</span>
    <span>{modulePct}%</span>
  </div>

  <div className="h-1.5 rounded-full bg-borderSubtle">
    <div
      className="h-full rounded-full bg-brand"
      style={{ width: `${modulePct}%` }}
    />
  </div>
</div>
              {expandedModules.includes(module.id) && (
  <ul className="mt-4 space-y-2">
                {module.lessons.map((lesson) => {
                  const done = progress[lesson.id]?.completed;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={ROUTES.STUDENT.lesson(courseId, module.id, lesson.id)}
className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-white/5"                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-brand" />
                        ) : (
                          <Circle className="h-4 w-4 text-textMuted" />
                        )}
                        <div className="flex flex-col">
  <span>{lesson.title}</span>

  <span className="text-xs text-textMuted">
    {lesson.summary}
  </span>
</div>
                        <span className="ml-auto text-xs text-textMuted">{lesson.durationMinutes}m</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              )}
            </section>
          );
        })
        )}
      </div>
    </LearnShell>
  );
}
