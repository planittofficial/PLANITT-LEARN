"use client";

import { Award, Medal } from "lucide-react";

import { AchievementGrid } from "@/features/achievements/components/AchievementGrid";
import { StreakMilestones } from "@/features/achievements/components/StreakMilestones";
import { useAchievements } from "@/hooks/achievements/use-achievements";
import { useGamification } from "@/features/gamification";
import { useAuth } from "@/context/auth-context";

export function AchievementsView() {
  const { user } = useAuth();
  const gamification = useGamification(user?.id);
  const { achievements, unlockedCount, totalCount, isLoading } = useAchievements(user?.id);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 rounded-2xl bg-overlay-hover" />
        <div className="h-40 rounded-2xl bg-overlay-hover" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-overlay-hover" />
          ))}
        </div>
      </div>
    );
  }

  const completionPct =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in">
      <header className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-surface to-orange-500/10 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-400">
          <Award className="h-3.5 w-3.5" />
          Achievements
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Your learning badges</h1>
        <p className="mt-2 max-w-xl text-sm text-textSecondary">
          Earn badges for streaks, lesson milestones, course completions, and more. Every badge
          celebrates a step on your learning journey.
        </p>

        <div className="mt-6 flex flex-wrap items-end gap-6">
          <div>
            <p className="text-4xl font-bold text-textPrimary">
              {unlockedCount}
              <span className="text-lg font-normal text-textMuted">/{totalCount}</span>
            </p>
            <p className="text-xs text-textMuted">badges earned</p>
          </div>
          <div className="flex-1 min-w-[160px] max-w-xs">
            <div className="mb-1 flex justify-between text-xs text-textMuted">
              <span>Collection progress</span>
              <span>{completionPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-overlay-medium">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-borderSubtle bg-overlay-subtle px-4 py-2">
            <Medal className="h-5 w-5 text-brand" />
            <div>
              <p className="text-xs text-textMuted">XP earned</p>
              <p className="font-bold">{gamification.xp.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </header>

      <StreakMilestones
        currentStreak={gamification.streak}
        longestStreak={gamification.longestStreak}
      />

      <AchievementGrid achievements={achievements} />
    </div>
  );
}
