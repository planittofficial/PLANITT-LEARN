"use client";

import { BookOpen, Flame, Target, TrendingUp, Zap } from "lucide-react";

import { StatCard } from "@/components/ui/StatCard";
import { StreakBadge } from "@/features/gamification";
import { getLevelInfo } from "@/lib/learning/gamification";

type LearningStatsGridProps = {
  enrolledCount: number;
  lessonsCompleted: number;
  totalLessons: number;
  avgProgress: number;
  streak: number;
  xp: number;
};

export function LearningStatsGrid({
  enrolledCount,
  lessonsCompleted,
  totalLessons,
  avgProgress,
  streak,
  xp,
}: LearningStatsGridProps) {
  const level = getLevelInfo(xp);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <StreakBadge streak={streak} />
        <span className="text-xs text-textMuted">
          Level {level.level} · {level.title}
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled courses" value={enrolledCount} icon={BookOpen} accent="brand" />
        <StatCard
          label="Lessons done"
          value={`${lessonsCompleted}/${totalLessons}`}
          icon={TrendingUp}
          accent="emerald"
        />
        <StatCard label="Avg. progress" value={`${avgProgress}%`} icon={Target} accent="sky" />
        <StatCard
          label="Total XP"
          value={xp.toLocaleString()}
          hint={`${level.progressToNext}% to next level`}
          icon={Zap}
          accent="amber"
        />
      </div>
      {streak > 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-textMuted">
          <Flame className="h-3.5 w-3.5 text-orange-400" />
          Keep your streak alive — learn something today!
        </p>
      ) : null}
    </div>
  );
}
