"use client";

import {
  BookOpen,
  Clock,
  Layers,
  Target,
  Trophy,
} from "lucide-react";

import { WeeklyProgressChart } from "@/features/student-dashboard/components/WeeklyProgressChart";
import { AnalyticsStatCard } from "@/features/student-analytics/components/AnalyticsStatCard";
import { CourseProgressBreakdown } from "@/features/student-analytics/components/CourseProgressBreakdown";
import { RankXpPanel } from "@/features/student-analytics/components/RankXpPanel";
import { useStudentAnalytics } from "@/hooks/analytics/use-student-analytics";
import { useAuth } from "@/context/auth-context";
import { formatLearningTime } from "@/lib/learning/student-analytics";

export function StudentAnalyticsView() {
  const { user } = useAuth();
  const { data, isLoading, leaderboardLoading } = useStudentAnalytics();

  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-2xl bg-overlay-hover" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-overlay-hover" />
          ))}
        </div>
      </div>
    );
  }

  const quizDisplay =
    data.quizAverageScore !== null ? `${data.quizAverageScore}%` : "—";
  const quizHint =
    data.quizAttempts > 0
      ? `${data.quizAttempts} attempt${data.quizAttempts !== 1 ? "s" : ""}`
      : "Take a quiz to track scores";

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="relative overflow-hidden rounded-2xl border border-brand/15 bg-gradient-to-br from-brand/10 via-surface to-violet-500/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Learning analytics</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          Your progress at a glance
        </h1>
        <p className="mt-2 max-w-xl text-sm text-textSecondary">
          Track hours learned, completion rates, quiz performance, and how you rank against other
          learners this week.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnalyticsStatCard
          label="Hours learned"
          value={formatLearningTime(data.totalMinutesLearned)}
          hint={`${data.totalHoursLearned} hours total`}
          icon={Clock}
          accent="brand"
          large
        />
        <AnalyticsStatCard
          label="Lessons completed"
          value={`${data.lessonsCompleted}/${data.totalLessons}`}
          hint={`${data.totalLessons > 0 ? Math.round((data.lessonsCompleted / data.totalLessons) * 100) : 0}% of catalog`}
          icon={BookOpen}
          accent="emerald"
          large
        />
        <AnalyticsStatCard
          label="Modules completed"
          value={`${data.modulesCompleted}/${data.totalModules}`}
          hint="Full modules finished"
          icon={Layers}
          accent="sky"
          large
        />
        <AnalyticsStatCard
          label="Quiz average"
          value={quizDisplay}
          hint={quizHint}
          icon={Target}
          accent="amber"
        />
        <AnalyticsStatCard
          label="Current rank"
          value={data.leaderboardRank ? `#${data.leaderboardRank}` : "—"}
          hint={
            leaderboardLoading
              ? "Loading…"
              : data.leaderboardScore !== null
                ? `${data.leaderboardScore.toLocaleString()} points`
                : "Complete lessons to rank"
          }
          icon={Trophy}
          accent="violet"
        />
        <AnalyticsStatCard
          label="Weekly lessons"
          value={data.weeklyActivity.reduce((s, d) => s + d.lessonsCompleted, 0)}
          hint="Completed in last 7 days"
          icon={BookOpen}
          accent="rose"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <WeeklyProgressChart days={data.weeklyActivity} className="lg:col-span-3" />
        <RankXpPanel
          className="lg:col-span-2"
          name={user?.name ?? "Learner"}
          rank={data.leaderboardRank}
          score={data.leaderboardScore}
          xp={data.xp}
          streak={data.streak}
          longestStreak={data.longestStreak}
          level={data.level}
          levelTitle={data.levelTitle}
        />
      </div>

      <CourseProgressBreakdown courses={data.courseBreakdown} />
    </div>
  );
}
