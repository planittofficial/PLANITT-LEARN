"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Lock, Trophy, Zap } from "lucide-react";

import { DashboardSkeleton } from "@/components/ui/skeletons";
import { NoCoursesEmpty } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { alvestCheckoutUrl } from "@/constants/urls";
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
import { getLevelInfo } from "@/lib/learning/gamification";
import { cn } from "@/lib/utils";
import type { CourseProgress } from "@/lib/learning/progress";

export function MyCoursesSection() {
  const { user, devStandalone } = useAuth();
  const { loading, enrolledIds, isAuthenticated, devPreview } = useEnrollment();
  const { data: apiCourses, isLoading: coursesLoading } = useCourses();
  const gamification = useGamification(user?.id);
  const achievements = useAchievements(user?.id);

  const [activeFilter, setActiveFilter] = useState<"all" | "purchased" | "new">("all");

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

  const continueCourse =
    courseStats.find((c) => c.percent > 0 && c.percent < 100) ??
    courseStats.find((c) => c.percent === 0);

  const level = getLevelInfo(gamification.xp);
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
              className="inline-flex rounded bg-brand px-5 py-2.5 font-mono text-xs font-bold text-black uppercase tracking-wider transition hover:brightness-110"
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
            <div className="grid grid-cols-12 gap-6 mb-8">
              <div className={cn(continueCourse ? "col-span-12 lg:col-span-8" : "col-span-12")}>
                {continueCourse && user?.id ? (
                  <ContinueLearningCard
                    course={continueCourse.course}
                    userId={user.id}
                    progressPercent={continueCourse.percent}
                    completedLessons={continueCourse.completed}
                    totalLessons={continueCourse.total}
                  />
                ) : (
                  <div className="p-8 rounded-lg border border-borderSubtle bg-surface/60 backdrop-blur-md flex flex-col justify-center min-h-[320px] text-center">
                    <p className="font-headline text-2xl font-extrabold text-textPrimary mb-2 tracking-tight">All caught up</p>
                    <p className="text-xs text-textSecondary font-mono uppercase tracking-wider">You have completed all enrolled courses. Choose another course to keep going.</p>
                  </div>
                )}
              </div>

              {isAuthenticated ? (
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                  <div className="p-6 rounded-lg border border-borderSubtle bg-surface/60 backdrop-blur-md flex flex-col justify-between flex-1 min-h-[148px] terminal-glow relative group hover:border-brand/40 transition">
                    <p className="font-mono text-[9px] text-textSecondary uppercase tracking-widest mb-4">Learning points</p>
                    <div className="flex items-end justify-between">
                      <p className="font-mono text-4xl font-extrabold text-brand tracking-tighter leading-none">{gamification.xp.toLocaleString()}</p>
                      <Zap className="text-brand/35 h-7 w-7 group-hover:text-brand transition-colors animate-pulse-live" />
                    </div>
                  </div>
                  <div className="p-6 rounded-lg border border-borderSubtle bg-surface/60 backdrop-blur-md flex flex-col justify-between flex-1 min-h-[148px] relative group hover:border-brand/40 transition">
                    <p className="font-mono text-[9px] text-textSecondary uppercase tracking-widest mb-4">Learner level</p>
                    <div className="flex items-end justify-between">
                      <div className="font-mono leading-none">
                        <p className="text-2xl font-black text-textPrimary">LEVEL {level.level}</p>
                        <span className="block text-[9px] text-brand/60 font-bold tracking-widest uppercase mt-1">
                          {level.title}
                        </span>
                      </div>
                      <Trophy className="text-textPrimary/25 h-7 w-7 group-hover:text-brand transition-colors" />
                    </div>
                  </div>
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
                      ? "bg-brand text-black font-bold shadow-[0_0_10px_rgba(20,184,166,0.15)]"
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
                      ? "bg-brand text-black font-bold shadow-[0_0_10px_rgba(20,184,166,0.15)]"
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
                      ? "bg-brand text-black font-bold shadow-[0_0_10px_rgba(20,184,166,0.15)]"
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
