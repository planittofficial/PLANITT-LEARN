"use client";

import { Flame } from "lucide-react";

import { ProgressBar } from "@/components/ui/ProgressBar";
import { STREAK_MILESTONES, getNextStreakMilestone } from "@/lib/learning/achievements";
import { cn } from "@/lib/utils";

type StreakMilestonesProps = {
  currentStreak: number;
  longestStreak: number;
  className?: string;
};

export function StreakMilestones({
  currentStreak,
  longestStreak,
  className,
}: StreakMilestonesProps) {
  const { next, progress } = getNextStreakMilestone(longestStreak);

  return (
    <section
      className={cn(
        "rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-surface to-amber-500/5 p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-orange-400">
            <Flame className="h-3.5 w-3.5" />
            Streak milestones
          </p>
          <p className="mt-1 text-sm text-textSecondary">
            {currentStreak > 0
              ? `${currentStreak} day${currentStreak !== 1 ? "s" : ""} active — keep it going!`
              : "Complete a lesson today to start your streak"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-400">{longestStreak}</p>
          <p className="text-xs text-textMuted">best streak</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-1">
        {STREAK_MILESTONES.map((milestone) => {
          const reached = longestStreak >= milestone;
          return (
            <div key={milestone} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition",
                  reached
                    ? "border-orange-400/50 bg-orange-500/20 text-orange-300"
                    : "border-borderSubtle bg-black/30 text-textMuted",
                )}
              >
                {milestone}
              </div>
              <span className="text-[10px] text-textMuted">days</span>
            </div>
          );
        })}
      </div>

      {next ? (
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs text-textMuted">
            <span>Progress to {next}-day milestone</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} size="sm" />
        </div>
      ) : (
        <p className="mt-4 text-center text-xs font-medium text-orange-400">
          All streak milestones unlocked — legendary dedication!
        </p>
      )}
    </section>
  );
}
