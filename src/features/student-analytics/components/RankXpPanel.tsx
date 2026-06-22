"use client";

import Link from "next/link";
import { Flame, Medal, Trophy, Zap } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { XpBar } from "@/features/gamification";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

type RankXpPanelProps = {
  name: string;
  rank: number | null;
  score: number | null;
  xp: number;
  streak: number;
  longestStreak: number;
  level: number;
  levelTitle: string;
  className?: string;
};

export function RankXpPanel({
  name,
  rank,
  score,
  xp,
  streak,
  longestStreak,
  level,
  levelTitle,
  className,
}: RankXpPanelProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-borderSubtle bg-gradient-to-br from-violet-500/10 via-surface to-brand/5 p-5",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar name={name} size="lg" highlight={rank !== null && rank <= 10} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-textMuted">Your standing</p>
          <p className="truncate font-semibold text-textPrimary">{name}</p>
          <p className="text-xs text-textSecondary">
            Level {level} · {levelTitle}
          </p>
        </div>
        {rank ? (
          <div className="text-right">
            <p className="text-3xl font-bold text-textPrimary">#{rank}</p>
            <p className="text-xs text-textMuted">{score?.toLocaleString() ?? 0} pts</p>
          </div>
        ) : (
          <Medal className="h-8 w-8 text-textMuted" />
        )}
      </div>

      <div className="mt-5">
        <XpBar xp={xp} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-borderSubtle/80 bg-black/20 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs text-textMuted">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            Current streak
          </p>
          <p className="mt-1 text-lg font-bold">{streak} day{streak !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-xl border border-borderSubtle/80 bg-black/20 px-3 py-2.5">
          <p className="flex items-center gap-1 text-xs text-textMuted">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Best streak
          </p>
          <p className="mt-1 text-lg font-bold">{longestStreak} day{longestStreak !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <Link
        href={ROUTES.STUDENT.ACHIEVEMENTS}
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
      >
        <Medal className="h-3.5 w-3.5" />
        View achievements →
      </Link>

      <Link
        href={ROUTES.STUDENT.LEADERBOARD}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-textMuted hover:text-brand hover:underline"
      >
        <Trophy className="h-3.5 w-3.5" />
        View full leaderboard →
      </Link>
    </section>
  );
}
