"use client";

import { Medal, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { LeaderboardEmpty } from "@/components/shared/EmptyState";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/leaderboard/use-leaderboard";
import { cn } from "@/lib/utils";

const PODIUM_STYLES = [
  "from-amber-400/20 to-amber-600/5 border-amber-500/30",
  "from-slate-300/15 to-slate-500/5 border-slate-400/30",
  "from-orange-600/20 to-orange-800/5 border-orange-600/30",
];

const MEDALS = ["🥇", "🥈", "🥉"];

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: number }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border bg-gradient-to-b p-5 text-center",
        PODIUM_STYLES[place],
        entry.isCurrentUser && "ring-2 ring-brand/50",
      )}
    >
      <span className="text-3xl">{MEDALS[place]}</span>
      <p className="mt-2 font-semibold text-textPrimary">{entry.name}</p>
      <p className="mt-1 text-2xl font-bold text-brand">{entry.totalScore.toLocaleString()}</p>
      <p className="text-xs text-textMuted">points</p>
      <Badge variant="brand" className="mt-3">
        {entry.completionPercent}% complete
      </Badge>
    </div>
  );
}

function RankingRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-borderSubtle bg-surface px-4 py-3 transition",
        entry.isCurrentUser && "border-brand/40 bg-brand/5",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold",
          entry.rank <= 3 ? "bg-brand/15 text-brand" : "bg-overlay-hover text-textMuted",
        )}
      >
        {entry.rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-textPrimary">
          {entry.name}
          {entry.isCurrentUser ? (
            <span className="ml-2 text-xs text-brand">(You)</span>
          ) : null}
        </p>
        <p className="text-xs text-textMuted">
          {entry.lessonsCompleted} lessons · {entry.completionPercent}% complete
        </p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-brand">{entry.totalScore.toLocaleString()}</p>
        <p className="text-xs text-textMuted">pts</p>
      </div>
    </div>
  );
}

export function LeaderboardView() {
  const { entries, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return <LeaderboardEmpty />;
  }

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="space-y-8">
      {/* Top 3 podium */}
      <div className="grid gap-4 sm:grid-cols-3">
        {top3[1] ? <PodiumCard entry={top3[1]} place={1} /> : null}
        {top3[0] ? (
          <div className="order-first sm:order-none sm:-mt-4">
            <PodiumCard entry={top3[0]} place={0} />
          </div>
        ) : null}
        {top3[2] ? <PodiumCard entry={top3[2]} place={2} /> : null}
      </div>

      {/* Full rankings */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <Medal className="h-5 w-5 text-brand" />
          All rankings
        </h2>
        <div className="space-y-2">
          {rest.map((entry) => (
            <RankingRow key={entry.userId} entry={entry} />
          ))}
        </div>
      </section>
    </div>
  );
}
