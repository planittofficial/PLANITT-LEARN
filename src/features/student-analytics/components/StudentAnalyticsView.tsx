"use client";

import {
  BookOpen,
  Clock,
  Layers,
  Target,
  Trophy,
  Activity
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
        <div className="h-32 rounded-xl bg-overlay-subtle" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-overlay-subtle" />
          ))}
        </div>
      </div>
    );
  }

  const quizDisplay =
    data.quizAverageScore !== null ? `${data.quizAverageScore}%` : "—";
  const quizHint =
    data.quizAttempts > 0
      ? `${data.quizAttempts} attempts`
      : "No attempts registered";

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Premium Header */}
      <header className="relative overflow-hidden rounded-lg border border-borderSubtle bg-surface/60 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-brand/40 uppercase tracking-widest">
          NODE_ANALYTICS_V2.4
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-[1.5px] bg-brand"></span>
          <span className="font-mono text-[9px] text-brand uppercase tracking-widest font-bold">MONITORING_SUITE</span>
        </div>
        <h1 className="font-headline text-3xl font-extrabold text-textPrimary tracking-tight uppercase">
          PERFORMANCE_METRICS
        </h1>
        <p className="mt-2 max-w-xl text-xs text-textSecondary leading-relaxed">
          Real-time tracking of hours learned, completion matrices, quiz performance indexes, and competitive leaderboard rankings.
        </p>
      </header>

      {/* Stats Cards Grid */}
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

      {/* Chart and XP Bento Section */}
      <div className="grid gap-6 lg:grid-cols-5">
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
