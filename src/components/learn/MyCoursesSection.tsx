"use client";

import Link from "next/link";

import { CourseCard } from "@/components/learn/CourseCard";
import { useAuth } from "@/context/auth-context";
import { useEnrollment } from "@/hooks/useEnrollment";
import { COURSE_CATALOG } from "@/lib/catalog/courses";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { countCompletedLessons, loadCourseProgress } from "@/lib/learning/progress";

export function MyCoursesSection() {
  const { user } = useAuth();
  const { loading, enrolledIds, isAuthenticated, devPreview } = useEnrollment();

  if (loading) {
    return <p className="text-sm text-textSecondary">Loading your courses…</p>;
  }

  const enrolledCount = COURSE_CATALOG.filter((c) =>
    isEnrolledInCourse(enrolledIds, c.id),
  ).length;

  function progressForCourse(courseId: string, lessonIds: string[]): number {
    if (!user?.id || lessonIds.length === 0) return 0;
    const progress = loadCourseProgress(user.id, courseId);
    const stats = countCompletedLessons(progress, lessonIds);
    return Math.round((stats.completed / stats.total) * 100);
  }

  return (
    <div className="space-y-6">
      {devPreview ? (
        <div className="rounded-xl border border-brand/30 bg-brand/5 p-4 text-sm text-textSecondary">
          <strong className="text-brand">Local preview</strong> — courses from{" "}
          <code className="text-brand">LEARN_DEV_MOCK_ENROLLMENTS</code>.{" "}
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign in as dev user
          </Link>{" "}
          to open lessons and save progress.
        </div>
      ) : null}

      {!isAuthenticated && !devPreview ? (
        <div className="rounded-xl border border-borderSubtle bg-surface p-6 text-sm text-textSecondary">
          <Link href="/login" className="font-medium text-brand hover:underline">
            Sign in
          </Link>{" "}
          to see courses linked to your Planitt account.
        </div>
      ) : null}

      {(isAuthenticated || devPreview) && enrolledCount === 0 ? (
        <p className="rounded-xl border border-dashed border-borderSubtle p-6 text-sm text-textSecondary">
          No enrolled courses. Set{" "}
          <code className="text-brand">LEARN_DEV_MOCK_ENROLLMENTS=learn-all-courses-combo</code> in{" "}
          <code className="text-brand">.env.local</code>, restart the dev server
          {isAuthenticated ? ", then sign in again" : ""}.
        </p>
      ) : null}

      {(isAuthenticated || devPreview) && enrolledCount > 0 ? (
        <>
          <p className="text-sm text-textSecondary">
            {enrolledCount} of {COURSE_CATALOG.length} courses enrolled
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {COURSE_CATALOG.map((course) => {
              const enrolled = isEnrolledInCourse(enrolledIds, course.id);
              const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
              const pct =
                isAuthenticated && enrolled
                  ? progressForCourse(course.id, lessonIds)
                  : undefined;
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled={enrolled}
                  preview={devPreview && !isAuthenticated}
                  progressPercent={pct}
                />
              );
            })}
          </div>
        </>
      ) : null}

      {devPreview && enrolledCount > 0 ? (
        <p className="text-xs text-textMuted">
          Locked cards in preview mode — sign in to explore modules and lessons.
        </p>
      ) : null}
    </div>
  );
}
