"use client";

import Link from "next/link";
import { Medal, Trophy } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { ROUTES } from "@/constants/routes";
import { useLeaderboard } from "@/hooks/leaderboard/use-leaderboard";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

type LeaderboardRankCardProps = {
  className?: string;
};

export function LeaderboardRankCard({ className }: LeaderboardRankCardProps) {
  const { user } = useAuth();
  const { entries, isLoading } = useLeaderboard("learn-forex-master-track");

  const me = entries.find((e) => e.userId === user?.id) ?? entries.find((e) => e.isCurrentUser);
  const rank = me?.rank ?? null;

  return (
    <Link
      href={ROUTES.STUDENT.LEADERBOARD}
      className={cn(
        "group block rounded-2xl border border-borderSubtle bg-gradient-to-br from-violet-500/10 via-surface to-base p-5 transition hover:border-brand/30",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-violet-400">
        <Trophy className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Leaderboard</span>
      </div>

      {isLoading ? (
        <p className="mt-4 text-sm text-textMuted">Loading rank…</p>
      ) : rank ? (
        <div className="mt-4 flex items-center gap-4">
          <Avatar name={me?.name ?? user?.name ?? "You"} highlight />
          <div>
            <p className="text-3xl font-bold text-textPrimary">#{rank}</p>
            <p className="text-sm text-textSecondary">
              {me?.totalScore.toLocaleString() ?? 0} pts · {me?.completionPercent ?? 0}% done
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <Medal className="h-8 w-8 text-textMuted" />
          <p className="mt-2 text-sm text-textSecondary">Complete lessons to earn your rank</p>
        </div>
      )}

      <p className="mt-4 text-xs text-brand group-hover:underline">View full leaderboard →</p>
    </Link>
  );
}
