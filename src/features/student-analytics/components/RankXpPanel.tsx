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
    <section className={cn("rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md p-5 shadow-2xl relative", className)}>
      <div className="flex items-center gap-4">
        <Avatar name={name} size="lg" highlight={rank !== null && rank <= 10} className="ring-1 ring-white/10" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[9px] uppercase tracking-widest text-textMuted">USER_STANDING</p>
          <p className="truncate font-headline font-bold text-textPrimary text-sm">{name}</p>
          <p className="font-mono text-[10px] text-textSecondary uppercase tracking-wider mt-0.5">
            LVL {level} · {levelTitle}
          </p>
        </div>
        {rank ? (
          <div className="text-right">
            <p className="font-mono text-2xl font-extrabold text-textPrimary leading-none">#{rank}</p>
            <p className="font-mono text-[9px] text-textMuted uppercase mt-1">{score?.toLocaleString() ?? 0} pts</p>
          </div>
        ) : (
          <Medal className="h-6 w-6 text-textMuted" />
        )}
      </div>

      <div className="mt-5">
        <XpBar xp={xp} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded border border-white/5 bg-[#1C1B1B]/40 px-3 py-2.5">
          <p className="flex items-center gap-1 font-mono text-[9px] text-textMuted uppercase tracking-wider">
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            Current streak
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-textPrimary">{streak} day{streak !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded border border-white/5 bg-[#1C1B1B]/40 px-3 py-2.5">
          <p className="flex items-center gap-1 font-mono text-[9px] text-textMuted uppercase tracking-wider">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            Best streak
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-textPrimary">{longestStreak} day{longestStreak !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-wider">
        <Link
          href={ROUTES.STUDENT.ACHIEVEMENTS}
          className="inline-flex items-center gap-1.5 text-brand hover:underline"
        >
          <Medal className="h-3.5 w-3.5" />
          [View Achievements]
        </Link>

        <Link
          href={ROUTES.STUDENT.LEADERBOARD}
          className="inline-flex items-center gap-1.5 text-textMuted hover:text-brand"
        >
          <Trophy className="h-3.5 w-3.5" />
          [View Leaderboard]
        </Link>
      </div>
    </section>
  );
}
