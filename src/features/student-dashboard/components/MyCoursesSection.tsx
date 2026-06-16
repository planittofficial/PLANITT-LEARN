"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { planittCheckoutUrl } from "@/constants/urls";
import { CourseCard } from "@/features/course-catalog/components/CourseCard";
import { useAuth } from "@/context/auth-context";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { COURSE_CATALOG } from "@/lib/catalog/courses";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { countCompletedLessons, loadCourseProgress } from "@/lib/learning/progress";

export function MyCoursesSection() {
  const { user } = useAuth();
  const { loading, enrolledIds, isAuthenticated, devPreview, devStandalone } = useEnrollment();

  if (loading) {
    return <p className="text-sm text-textSecondary">Loading your courses…</p>;
  }

  const enrolledCourses = COURSE_CATALOG.filter((c) => isEnrolledInCourse(enrolledIds, c.id));

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
          <Link href={ROUTES.STUDENT.LOGIN} className="font-medium text-brand hover:underline">
            Sign in as dev user
          </Link>{" "}
          to open lessons and save progress.
        </div>
      ) : null}

      {!isAuthenticated && !devPreview ? (
        <div className="rounded-xl border border-borderSubtle bg-surface p-6 text-sm text-textSecondary">
          <Link href={ROUTES.STUDENT.LOGIN} className="font-medium text-brand hover:underline">
            Sign in
          </Link>{" "}
          with your Planitt Google account to see courses from your purchase history.
        </div>
      ) : null}

      {(isAuthenticated || devPreview) && enrolledCourses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-borderSubtle p-6 text-sm text-textSecondary">
          <p>No enrolled courses yet.</p>
          {devStandalone ? (
            <p className="mt-2">
              Local dev: set{" "}
              <code className="text-brand">LEARN_DEV_MOCK_ENROLLMENTS=learn-all-courses-combo</code>{" "}
              in <code className="text-brand">.env.local</code> and restart the dev server.
            </p>
          ) : (
            <p className="mt-2">
              Purchase a course on Planitt — your payment history will unlock it here automatically.
            </p>
          )}
          <a
            href={planittCheckoutUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block font-medium text-brand hover:underline"
          >
            Browse courses on Planitt →
          </a>
        </div>
      ) : null}

      {(isAuthenticated || devPreview) && enrolledCourses.length > 0 ? (
        <>
          <p className="text-sm text-textSecondary">
            {enrolledCourses.length} enrolled course{enrolledCourses.length === 1 ? "" : "s"}
          </p>
          <div className="grid gap-4 lg:grid-cols-2">
            {enrolledCourses.map((course) => {
              const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

              let pct: number | undefined;
              let completedLessons = 0;
              let totalLessons = lessonIds.length;

              if (isAuthenticated && user?.id) {
                const progress = loadCourseProgress(user.id, course.id);
                const stats = countCompletedLessons(progress, lessonIds);
                completedLessons = stats.completed;
                totalLessons = stats.total;
                pct =
                  stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
              }

              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled
                  preview={devPreview && !isAuthenticated}
                  progressPercent={pct}
                  completedLessons={completedLessons}
                  totalLessons={totalLessons}
                />
              );
            })}
          </div>
        </>
      ) : null}

      {devPreview && enrolledCourses.length > 0 ? (
        <p className="text-xs text-textMuted">
          Preview mode — sign in to open modules and lessons.
        </p>
      ) : null}
    </div>
  );
}
