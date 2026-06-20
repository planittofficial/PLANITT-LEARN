"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { DashboardSkeleton } from "@/components/ui/skeletons";
import { NoCoursesEmpty } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { planittCheckoutUrl } from "@/constants/urls";
import { CourseCard } from "@/features/course-catalog/components/CourseCard";
import {
  ContinueLearningCard,
  DashboardStats,
} from "@/features/student-dashboard/components/DashboardHero";
import { useAuth } from "@/context/auth-context";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { COURSE_CATALOG } from "@/lib/catalog/courses";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { getCourseProgressStats } from "@/lib/learning/course-progress";

export function MyCoursesSection() {
  const { user } = useAuth();
  const { loading, enrolledIds, isAuthenticated, devPreview, devStandalone } = useEnrollment();

  if (loading) {
    return <DashboardSkeleton />;
  }

  const enrolledCourses = COURSE_CATALOG.filter((c) => isEnrolledInCourse(enrolledIds, c.id));
  const lockedCourses = COURSE_CATALOG.filter((c) => !isEnrolledInCourse(enrolledIds, c.id));

  const courseStats = enrolledCourses.map((course) => ({
    course,
    ...getCourseProgressStats(user?.id, course),
  }));

  const totalLessons = courseStats.reduce((s, c) => s + c.total, 0);
  const lessonsCompleted = courseStats.reduce((s, c) => s + c.completed, 0);
  const avgProgress =
    courseStats.length > 0
      ? Math.round(courseStats.reduce((s, c) => s + c.percent, 0) / courseStats.length)
      : 0;

  const continueCourse = courseStats.find(
    (c) => c.percent > 0 && c.percent < 100,
  ) ?? courseStats.find((c) => c.percent === 0);

  return (
    <div className="space-y-10">
      {devPreview ? (
        <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-textSecondary">
          <strong className="text-brand">Preview mode</strong> — showing mock enrollments.{" "}
          <Link href={ROUTES.STUDENT.LOGIN} className="font-medium text-brand hover:underline">
            Sign in
          </Link>{" "}
          to save progress.
        </div>
      ) : null}

      {!isAuthenticated && !devPreview ? (
        <div className="rounded-2xl border border-borderSubtle bg-surface p-8 text-center">
          <p className="text-textSecondary">
            <Link href={ROUTES.STUDENT.LOGIN} className="font-semibold text-brand hover:underline">
              Sign in
            </Link>{" "}
            with your Planitt Google account to see your courses.
          </p>
        </div>
      ) : null}

      {(isAuthenticated || devPreview) && enrolledCourses.length === 0 ? (
        <NoCoursesEmpty
          action={
            <a
              href={planittCheckoutUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-black hover:brightness-110"
            >
              Browse courses on Planitt →
            </a>
          }
        />
      ) : null}

      {(isAuthenticated || devPreview) && enrolledCourses.length > 0 ? (
        <>
          {isAuthenticated ? (
            <DashboardStats
              enrolledCount={enrolledCourses.length}
              lessonsCompleted={lessonsCompleted}
              totalLessons={totalLessons}
              avgProgress={avgProgress}
            />
          ) : null}

          {isAuthenticated && continueCourse && user?.id ? (
            <ContinueLearningCard
              course={continueCourse.course}
              userId={user.id}
              progressPercent={continueCourse.percent}
              completedLessons={continueCourse.completed}
              totalLessons={continueCourse.total}
            />
          ) : null}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-textPrimary">
                My courses
                <span className="ml-2 text-sm font-normal text-textMuted">
                  ({enrolledCourses.length})
                </span>
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {courseStats.map(({ course, percent, completed, total }) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled
                  preview={devPreview && !isAuthenticated}
                  progressPercent={percent}
                  completedLessons={completed}
                  totalLessons={total}
                />
              ))}
            </div>
          </section>

          {lockedCourses.length > 0 ? (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4 text-textMuted" />
                <h2 className="text-lg font-semibold text-textPrimary">
                  Explore more courses
                </h2>
                <span className="text-sm text-textMuted">({lockedCourses.length} locked)</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {lockedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} enrolled={false} />
                ))}
              </div>
              {!devStandalone ? (
                <p className="mt-4 text-center text-xs text-textMuted">
                  Purchase on{" "}
                  <a href={planittCheckoutUrl()} className="text-brand hover:underline">
                    Planitt
                  </a>{" "}
                  to unlock — same Google account works here automatically.
                </p>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
