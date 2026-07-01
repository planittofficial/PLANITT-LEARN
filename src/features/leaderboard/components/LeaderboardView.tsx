"use client";

import { Medal, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { LeaderboardEmpty } from "@/components/shared/EmptyState";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/leaderboard/use-leaderboard";
import { cn } from "@/lib/utils";

const PODIUM_TITLES = ["Market King 👑", "Trend Runner 📈", "Profit Scalper 📊"];
const PODIUM_STYLES = [
  "from-amber-400/20 via-surface to-amber-600/5 border-amber-500/35 glow-amber animate-pulse-glow",
  "from-slate-300/15 via-surface to-slate-500/5 border-slate-400/30",
  "from-orange-600/20 via-surface to-orange-800/5 border-orange-600/30",
];

const MEDALS = ["🥇", "🥈", "🥉"];

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: number }) {
  const getTrendPercent = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const pct = 5.0 + (Math.abs(hash) % 15.0);
    return pct.toFixed(1);
  };

  const trend = getTrendPercent(entry.name);

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border bg-gradient-to-b p-5 text-center transition-all duration-300 card-trading",
        PODIUM_STYLES[place],
        entry.isCurrentUser && "ring-2 ring-brand/50",
      )}
    >
      <span className="text-4xl filter drop-shadow-md">{MEDALS[place]}</span>
      <p className="mt-2 text-xs font-extrabold uppercase tracking-wider text-brand">
        {PODIUM_TITLES[place]}
      </p>
      <p className="mt-1 font-bold text-textPrimary text-base">{entry.name}</p>
      <p className="mt-2 text-3xl font-black text-brand tracking-tight">
        {entry.totalScore.toLocaleString()}
      </p>
      <p className="text-[10px] text-textMuted uppercase font-bold tracking-wider">points</p>
      
      <div className="mt-3 flex flex-col gap-1 items-center">
        <Badge variant="success" className="text-[10px] font-bold">
          ▲ +{trend}% Yield
        </Badge>
        <span className="text-[10px] text-textMuted mt-1">
          {entry.completionPercent}% complete
        </span>
      </div>
    </div>
  );
}

function RankingRow({ entry }: { entry: LeaderboardEntry }) {
  const getTrendPercent = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const pct = 1.2 + (Math.abs(hash) % 8.5);
    return pct.toFixed(1);
  };

  const trend = getTrendPercent(entry.name);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-borderSubtle bg-surface px-4 py-3 transition card-trading",
        entry.isCurrentUser && "border-brand/40 bg-brand/5 shadow-sm shadow-brand/10",
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
        <p className="font-medium text-textPrimary flex items-center gap-2">
          {entry.name}
          {entry.isCurrentUser ? (
            <span className="text-[10px] bg-brand/20 text-brand px-1.5 py-0.5 rounded font-bold">YOU</span>
          ) : null}
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5 animate-pulse">
            ▲ +{trend}%
          </span>
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
