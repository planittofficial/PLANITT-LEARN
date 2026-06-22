"use client";

import Link from "next/link";
import { BarChart3, Layers, Trophy } from "lucide-react";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { ROUTES } from "@/constants/routes";
import type { CourseAnalyticsRow } from "@/lib/learning/student-analytics";

type CourseProgressBreakdownProps = {
  courses: CourseAnalyticsRow[];
};

export function CourseProgressBreakdown({ courses }: CourseProgressBreakdownProps) {
  const active = courses.filter((c) => c.lessonsCompleted > 0);
  const sorted = [...(active.length ? active : courses)].sort((a, b) => b.percent - a.percent);

  if (sorted.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-borderSubtle bg-surface/50 p-8 text-center">
        <BarChart3 className="mx-auto h-8 w-8 text-textMuted" />
        <p className="mt-3 text-sm text-textSecondary">Start a course to see your breakdown here.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-borderSubtle bg-surface/80 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-textPrimary">Progress by course</h2>
        <span className="text-xs text-textMuted">{sorted.length} courses</span>
      </div>
      <ul className="space-y-4">
        {sorted.map((course) => (
          <li key={course.courseId}>
            <Link
              href={ROUTES.STUDENT.course(course.courseId)}
              className="group block rounded-xl border border-transparent p-3 transition hover:border-borderSubtle hover:bg-white/[0.02]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium group-hover:text-brand">{course.title}</p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-textMuted">
                    <span>{course.category}</span>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {course.modulesCompleted}/{course.totalModules} modules
                    </span>
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-brand">{course.percent}%</span>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={course.percent}
                  size="sm"
                  label={`${course.lessonsCompleted}/${course.totalLessons} lessons`}
                  showLabel
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
