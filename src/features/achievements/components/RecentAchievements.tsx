"use client";

import Link from "next/link";
import { Award, ChevronRight } from "lucide-react";

import { AchievementBadge } from "@/features/achievements/components/AchievementBadge";
import { ROUTES } from "@/constants/routes";
import type { AchievementProgress } from "@/lib/learning/achievements";
import { cn } from "@/lib/utils";

type RecentAchievementsProps = {
  recentUnlocks: AchievementProgress[];
  unlockedCount: number;
  totalCount: number;
  compact?: boolean;
  className?: string;
};

export function RecentAchievements({
  recentUnlocks,
  unlockedCount,
  totalCount,
  compact = false,
  className,
}: RecentAchievementsProps) {
  const hasUnlocks = recentUnlocks.length > 0;

  return (
    <section
      className={cn(
        "rounded-2xl border border-borderSubtle bg-surface p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-400" />
          <div>
            <h2 className="font-semibold text-textPrimary">Achievements</h2>
            <p className="text-xs text-textMuted">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
        </div>
        <Link
          href={ROUTES.STUDENT.ACHIEVEMENTS}
          className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
        >
          View all
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {hasUnlocks ? (
        <div className={cn("grid gap-2", compact ? "grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3")}>
          {recentUnlocks.slice(0, compact ? 2 : 3).map((item) => (
            <AchievementBadge
              key={item.def.id}
              def={item.def}
              unlocked={item.unlocked}
              compact
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-borderSubtle bg-overlay-subtle px-4 py-6 text-center text-sm text-textMuted">
          Complete lessons and build streaks to earn your first badge.
        </p>
      )}
    </section>
  );
}
