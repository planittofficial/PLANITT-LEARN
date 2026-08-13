"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Lock } from "lucide-react";

import { DashboardSkeleton } from "@/components/ui/skeletons";
import { NoCoursesEmpty } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { alvestCheckoutUrl } from "@/constants/urls";
import { CourseCard } from "@/features/course-catalog/components/CourseCard";
import { LeaderboardRankCard } from "@/features/student-dashboard/components/LeaderboardRankCard";
import { LearnerStatsSidebar } from "@/features/student-dashboard/components/LearnerStatsSidebar";
import { LearningCommandCenter } from "@/features/student-dashboard/components/LearningCommandCenter";
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
import { getRecentlyWatched, getWeeklyActivity } from "@/lib/learning/activity";
import { isEnrolledInCourse } from "@/lib/learning/enrollment";
import { getContinueLessonUrl, getCourseProgressStats } from "@/lib/learning/course-progress";
import { cn } from "@/lib/utils";
import type { CourseProgress } from "@/lib/learning/progress";

export function MyCoursesSection() {
  const { user, devStandalone } = useAuth();
  const { loading, enrolledIds, isAuthenticated, devPreview, paymentHistoryError } = useEnrollment();
  const { data: apiCourses, isLoading: coursesLoading, isError: coursesError } = useCourses();
  const gamification = useGamification(user?.id);
  const achievements = useAchievements(user?.id);

  const [activeFilter, setActiveFilter] = useState<"all" | "purchased" | "new">("all");

  const catalog = useMemo(
    () => apiCourses.map(apiCourseListItemToDefinition),
    [apiCourses],
  );

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

  if (coursesError) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
      >
        Could not load courses right now. Please refresh the page or try again shortly.
      </div>
    );
  }

  const courseStats = enrolledCourses.map((course) => ({
    course,
    ...getCourseProgressStats(user?.id, course, progressByCourseId.get(course.id)),
  }));

  const lastVisited = recent.find((item) =>
    courseStats.some((c) => c.course.id === item.courseId),
  );
  const lastVisitedStats = lastVisited
    ? courseStats.find((c) => c.course.id === lastVisited.courseId)
    : undefined;
  const fallbackCourse =
    courseStats.find((c) => c.percent > 0 && c.percent < 100) ??
    courseStats.find((c) => c.percent === 0);

  const lastVisitedCourse =
    lastVisited && lastVisitedStats
      ? {
          course: lastVisitedStats.course,
          percent: lastVisitedStats.percent,
          completed: lastVisitedStats.completed,
          total: lastVisitedStats.total,
          continueUrl: ROUTES.STUDENT.lesson(
            lastVisited.courseId,
            lastVisited.moduleId,
            lastVisited.lessonId,
          ),
          lastLessonTitle: lastVisited.lessonTitle,
          watchedAt: lastVisited.watchedAt,
        }
      : fallbackCourse && user?.id
        ? {
            course: fallbackCourse.course,
            percent: fallbackCourse.percent,
            completed: fallbackCourse.completed,
            total: fallbackCourse.total,
            continueUrl:
              getContinueLessonUrl(
                user.id,
                fallbackCourse.course,
                progressByCourseId.get(fallbackCourse.course.id),
              ) ?? ROUTES.STUDENT.course(fallbackCourse.course.id),
            lastLessonTitle: undefined as string | undefined,
            watchedAt: undefined as string | undefined,
          }
        : undefined;

  const coursesInProgress = courseStats.filter((c) => c.percent > 0 && c.percent < 100).length;

  const firstName = user?.name?.split(" ")[0] ?? "Learner";

  const filteredEnrolled = courseStats.filter(({ percent }) => {
    if (activeFilter === "purchased") return percent > 0;
    if (activeFilter === "new") return percent === 0;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in">
      {devPreview ? (
        <div className="rounded border border-brand/35 bg-brand/5 px-4 py-3 font-mono text-[11px] tracking-wide text-textSecondary">
          <strong className="text-brand">Preview mode</strong> - showing sample enrollments.{" "}
          <Link href={ROUTES.STUDENT.LOGIN} className="font-bold text-brand hover:underline">
            [SIGN_IN]
          </Link>{" "}
          to save progress.
        </div>
      ) : null}

      {isAuthenticated && paymentHistoryError ? (
        <div
          role="alert"
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          {paymentHistoryError === "unauthorized"
            ? "Your session may have expired. Sign out and sign in again to refresh your course access."
            : "We could not verify your purchases right now. Your enrolled courses may be incomplete — try refreshing or check back shortly."}
        </div>
      ) : null}

      {!isAuthenticated && !devPreview ? (
        <div className="rounded-lg border border-borderSubtle bg-surface/60 backdrop-blur-md p-8 text-center font-mono">
          <p className="text-sm text-textSecondary">
            <Link href={ROUTES.STUDENT.LOGIN} className="font-bold text-brand hover:underline">
              [SIGN_IN]
            </Link>{" "}
            with your Alvest account to see your courses.
          </p>
        </div>
      ) : null}

      {(isAuthenticated || devPreview) && enrolledCourses.length === 0 ? (
        <NoCoursesEmpty
          action={
            <a
              href={alvestCheckoutUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg bg-brand px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-brandForeground transition hover:bg-brandHover"
            >
              Browse courses on Alvest
            </a>
          }
        />
      ) : null}

      {(isAuthenticated || devPreview) && enrolledCourses.length > 0 ? (
        <>
          {isAuthenticated ? (
            <WelcomeHero
              firstName={firstName}
              streak={gamification.streak}
            />
          ) : null}

          {(isAuthenticated || devPreview) && (
            <div className="mb-8 grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-8">
                {isAuthenticated ? (
                  <LearningCommandCenter
                    streak={gamification.streak}
                    xp={gamification.xp}
                    weeklyDays={weeklyDays}
                    lastVisitedCourse={lastVisitedCourse}
                    coursesInProgress={coursesInProgress}
                  />
                ) : (
                  <div className="flex min-h-[320px] flex-col justify-center rounded-lg border border-borderSubtle bg-surface/60 p-8 text-center backdrop-blur-md">
                    <p className="mb-2 font-headline text-2xl font-extrabold tracking-tight text-textPrimary">
                      Preview mode
                    </p>
                    <p className="font-mono text-xs uppercase tracking-wider text-textSecondary">
                      Sign in to unlock your learning dashboard.
                    </p>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div className="col-span-12 lg:col-span-4">
                  <LearnerStatsSidebar
                    xp={gamification.xp}
                    streak={gamification.streak}
                    lessonsCompletedTotal={gamification.lessonsCompletedTotal}
                    weeklyDays={weeklyDays}
                  />
                </div>
              ) : null}
            </div>
          )}

          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-borderSubtle pb-4">
              <div>
                <span className="font-mono text-[9px] text-brand tracking-widest uppercase block mb-1.5">Your courses</span>
                <h2 className="font-headline text-2xl font-extrabold text-textPrimary tracking-tight">
                  Learning library
                  <span className="ml-2 text-xs font-mono font-normal text-textMuted uppercase">
                    ({enrolledCourses.length} courses)
                  </span>
                </h2>
              </div>
              <div className="flex gap-1.5 p-1 bg-surface/80 rounded border border-borderSubtle w-fit">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={cn(
                    "px-4 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider transition-all",
                    activeFilter === "all"
                      ? "bg-brand font-bold text-brandForeground shadow-[0_0_10px_color-mix(in_srgb,var(--brand)_18%,transparent)]"
                      : "text-textSecondary hover:text-brand"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter("purchased")}
                  className={cn(
                    "px-4 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider transition-all",
                    activeFilter === "purchased"
                      ? "bg-brand font-bold text-brandForeground shadow-[0_0_10px_color-mix(in_srgb,var(--brand)_18%,transparent)]"
                      : "text-textSecondary hover:text-brand"
                  )}
                >
                  Purchased
                </button>
                <button
                  onClick={() => setActiveFilter("new")}
                  className={cn(
                    "px-4 py-1.5 rounded font-mono text-[10px] uppercase tracking-wider transition-all",
                    activeFilter === "new"
                      ? "bg-brand font-bold text-brandForeground shadow-[0_0_10px_color-mix(in_srgb,var(--brand)_18%,transparent)]"
                      : "text-textSecondary hover:text-brand"
                  )}
                >
                  New
                </button>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredEnrolled.map(({ course, percent, completed, total }) => (
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
            <div className="grid gap-6 lg:grid-cols-3 pt-6 border-t border-borderSubtle">
              <WeeklyProgressChart days={weeklyDays} className="lg:col-span-2" />
              <div className="space-y-6">
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
            <section className="pt-8 border-t border-borderSubtle space-y-6">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-textMuted" />
                <h2 className="font-headline text-lg font-bold text-textPrimary uppercase tracking-wider">Explore More Modules</h2>
                <span className="font-mono text-xs text-textMuted">({lockedCourses.length})</span>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {lockedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} enrolled={false} />
                ))}
              </div>
              {!devStandalone ? (
                <p className="mt-4 text-center font-mono text-[10px] text-textMuted uppercase tracking-wider">
                  Purchase on{" "}
                  <a href={alvestCheckoutUrl()} className="text-brand hover:underline font-bold">
                    [ALVEST]
                  </a>{" "}
                  to unlock - same Google account works here automatically.
                </p>
              ) : null}
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
