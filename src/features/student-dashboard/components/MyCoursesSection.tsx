"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { Lock } from "lucide-react";

import { DashboardSkeleton } from "@/components/ui/skeletons";
import { NoCoursesEmpty } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { planittCheckoutUrl } from "@/constants/urls";
import { CourseCard } from "@/features/course-catalog/components/CourseCard";
import { ContinueLearningCard } from "@/features/student-dashboard/components/DashboardHero";
import { LeaderboardRankCard } from "@/features/student-dashboard/components/LeaderboardRankCard";
import { RecentlyWatched } from "@/features/student-dashboard/components/RecentlyWatched";
import { WeeklyProgressChart } from "@/features/student-dashboard/components/WeeklyProgressChart";
import { WelcomeHero } from "@/features/student-dashboard/components/WelcomeHero";
import { RecentAchievements } from "@/features/achievements";
import { useGamification } from "@/features/gamification";
import { useAchievements } from "@/hooks/achievements/use-achievements";
import { useAuth } from "@/context/auth-context";
import { useCourses } from "@/hooks/courses/use-courses";
import { useEnrollment } from "@/hooks/enrollment/use-enrollment";
import { fetchCourseProgress } from "@/hooks/progress/use-course-progress";
import { apiCourseListItemToDefinition } from "@/lib/catalog/map-api-course";
import { COURSE_CATALOG } from "@/lib/catalog/courses";
import { getRecentlyWatched, getWeeklyActivity } from "@/lib/learning/activity";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { getCourseProgressStats } from "@/lib/learning/course-progress";
import type { CourseProgress } from "@/lib/learning/progress";

export function MyCoursesSection() {
  const { user } = useAuth();
  const { loading, enrolledIds, isAuthenticated, devPreview, devStandalone } = useEnrollment();
  const { data: apiCourses, isLoading: coursesLoading } = useCourses();
  const gamification = useGamification(user?.id);
  const achievements = useAchievements(user?.id);

  const catalog = useMemo(() => {
    if (apiCourses.length > 0) {
      return apiCourses.map(apiCourseListItemToDefinition);
    }
    return COURSE_CATALOG;
  }, [apiCourses]);

  const enrolledCourses = catalog.filter((c) => isEnrolledInCourse(enrolledIds, c.id));
  const lockedCourses = catalog.filter((c) => !isEnrolledInCourse(enrolledIds, c.id));

  const progressQueries = useQueries({
    queries: enrolledCourses.map((course) => ({
      queryKey: ["progress", "course", course.id, user?.id],
      queryFn: () => fetchCourseProgress(course.id, user!.id),
      enabled: Boolean(user?.id) && isAuthenticated,
      staleTime: 30_000,
    })),
  });

  const progressByCourseId = useMemo(() => {
    const map = new Map<string, CourseProgress>();
    enrolledCourses.forEach((course, index) => {
      map.set(course.id, progressQueries[index]?.data ?? {});
    });
    return map;
  }, [enrolledCourses, progressQueries]);

  const weeklyDays = useMemo(
    () => (user?.id ? getWeeklyActivity(user.id) : []),
    [user?.id, gamification.xp, achievements.unlockedCount],
  );
  const recent = useMemo(
    () => (user?.id ? getRecentlyWatched(user.id, 5) : []),
    [user?.id],
  );

  if (loading || coursesLoading) return <DashboardSkeleton />;

  const courseStats = enrolledCourses.map((course) => ({
    course,
    ...getCourseProgressStats(user?.id, course, progressByCourseId.get(course.id)),
  }));

  const totalLessons = courseStats.reduce((s, c) => s + c.total, 0);
  const lessonsCompleted = courseStats.reduce((s, c) => s + c.completed, 0);
  const avgProgress =
    courseStats.length > 0
      ? Math.round(courseStats.reduce((s, c) => s + c.percent, 0) / courseStats.length)
      : 0;

  const continueCourse =
    courseStats.find((c) => c.percent > 0 && c.percent < 100) ??
    courseStats.find((c) => c.percent === 0);

  const firstName = user?.name?.split(" ")[0] ?? "Learner";

  return (
    <div className="space-y-8 animate-in fade-in">
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
              className="inline-flex rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brandForeground transition hover:bg-brandHover dark:text-black dark:hover:brightness-110"
            >
              Browse courses on Planitt →
            </a>
          }
        />
      ) : null}

      {(isAuthenticated || devPreview) && enrolledCourses.length > 0 ? (
        <>
          {isAuthenticated ? (
            <WelcomeHero
              firstName={firstName}
              enrolledCount={enrolledCourses.length}
              lessonsCompleted={lessonsCompleted}
              totalLessons={totalLessons}
              avgProgress={avgProgress}
              streak={gamification.streak}
              xp={gamification.xp}
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
              <Link
                href={ROUTES.STUDENT.ANALYTICS}
                className="text-sm font-medium text-textSecondary hover:text-brand"
              >
                View progress →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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

          {isAuthenticated ? (
            <div className="grid gap-5 lg:grid-cols-3">
              <WeeklyProgressChart days={weeklyDays} className="lg:col-span-2" />
              <div className="space-y-5">
                <LeaderboardRankCard />
                <RecentAchievements
                  recentUnlocks={achievements.recentUnlocks}
                  unlockedCount={achievements.unlockedCount}
                  totalCount={achievements.totalCount}
                  compact
                />
              </div>
            </div>
          ) : null}

          {isAuthenticated && recent.length > 0 ? <RecentlyWatched items={recent} /> : null}

          {lockedCourses.length > 0 ? (
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Lock className="h-4 w-4 text-textMuted" />
                <h2 className="text-lg font-semibold text-textPrimary">Explore more courses</h2>
                <span className="text-sm text-textMuted">({lockedCourses.length})</span>
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
