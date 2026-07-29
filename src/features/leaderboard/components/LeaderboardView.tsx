"use client";

import { Medal, Trophy, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { LeaderboardEmpty } from "@/components/shared/EmptyState";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/leaderboard/use-leaderboard";
import { cn } from "@/lib/utils";

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: number }) {
  const borderColors = [
    "border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-surface",
    "border-slate-400/30 shadow-[0_0_15px_rgba(156,163,175,0.1)] bg-surface",
    "border-orange-500/30 shadow-[0_0_15px_rgba(217,119,6,0.1)] bg-surface",
  ];
  
  const initials = entry.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-xl border p-6 text-center transition-all duration-300 hover:scale-[1.02]",
        borderColors[place],
        entry.isCurrentUser && "ring-1 ring-brand"
      )}
    >
      {/* Glowing Avatar */}
      <div className="relative mb-4">
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center font-bold text-lg border",
          place === 0 
            ? "bg-amber-500/10 border-amber-500/40 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
            : place === 1 
              ? "bg-slate-400/10 border-slate-400/30 text-slate-300 shadow-[0_0_8px_rgba(156,163,175,0.15)]"
              : "bg-orange-500/10 border-orange-500/30 text-orange-400 shadow-[0_0_8px_rgba(217,119,6,0.15)]"
        )}>
          {initials}
        </div>
        <span className="absolute -bottom-1 -right-1 text-xs bg-surface border border-borderSubtle px-2 py-0.5 rounded font-mono font-bold leading-none text-textPrimary">
          #{place + 1}
        </span>
      </div>

      <p className="font-headline text-lg font-bold text-textPrimary truncate w-full">{entry.name}</p>
      
      <div className="mt-4 flex flex-col items-center">
        <span className="font-mono text-3xl font-extrabold text-brand tracking-tight">
          {entry.totalScore.toLocaleString()}
        </span>
        <span className="font-mono text-[9px] text-textSecondary uppercase tracking-widest font-bold">Points</span>
      </div>

      <Badge variant="success" className="mt-4 text-[10px] uppercase font-mono tracking-wider font-bold">
        {entry.completionPercent}% Complete
      </Badge>
    </div>
  );
}

function RankingRow({ entry }: { entry: LeaderboardEntry }) {
  const initials = entry.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-borderSubtle bg-surface px-5 py-4 transition-all duration-200 hover:border-brand/35",
        entry.isCurrentUser && "border-brand/40 bg-brand/5 shadow-[0_0_12px_rgba(20,184,166,0.05)]",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded font-mono text-xs font-bold border",
          entry.rank <= 3 
            ? "bg-brand/10 border-brand/20 text-brand" 
            : "bg-surface border-borderSubtle text-textSecondary",
        )}
      >
        {String(entry.rank).padStart(2, '0')}
      </span>
      
      {/* Avatar in list */}
      <div className="h-10 w-10 rounded-full bg-elevated border border-borderSubtle flex items-center justify-center font-bold text-xs text-textSecondary shrink-0">
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-headline font-bold text-textPrimary text-sm">
          {entry.name}
          {entry.isCurrentUser ? (
            <span className="rounded bg-brand/10 border border-brand/25 px-2 py-0.5 text-[9px] font-bold text-brand uppercase font-mono">
              YOU
            </span>
          ) : null}
        </p>
        <p className="text-xs text-textSecondary font-sans mt-0.5">
          {entry.lessonsCompleted} lessons completed · {entry.completionPercent}% course progress
        </p>
      </div>

      <div className="text-right">
        <p className="font-mono text-base font-bold text-brand">{entry.totalScore.toLocaleString()}</p>
        <p className="font-mono text-[9px] text-textSecondary uppercase tracking-widest font-bold">PTS</p>
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
      {/* Header section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-headline text-3xl font-bold text-textPrimary">Leaderboard</h2>
          <p className="font-mono text-xs text-textSecondary mt-1 uppercase tracking-wider">
            Top performers in execution & network ranking
          </p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-surface border border-borderSubtle rounded flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse shadow-[0_0_8px_#14B8A6]"></div>
            <span className="font-mono text-[10px] text-textPrimary uppercase tracking-wider font-bold">LIVE_SYNC</span>
          </div>
        </div>
      </section>

      {/* Podium grid */}
      <div className="grid gap-4 sm:grid-cols-3 items-end pt-4">
        {top3[1] ? (
          <div className="order-2 sm:order-1">
            <PodiumCard entry={top3[1]} place={1} />
          </div>
        ) : null}
        {top3[0] ? (
          <div className="order-1 sm:order-2 sm:-mt-6 z-10">
            <PodiumCard entry={top3[0]} place={0} />
          </div>
        ) : null}
        {top3[2] ? (
          <div className="order-3 sm:order-3">
            <PodiumCard entry={top3[2]} place={2} />
          </div>
        ) : null}
      </div>

      {/* Rankings list */}
      {rest.length > 0 ? (
        <section>
          <div className="mb-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-brand" />
              <span className="font-headline text-lg font-bold text-textPrimary">All Rankings</span>
            </div>
            <span className="font-mono text-[10px] text-textSecondary uppercase tracking-widest font-bold">
              {entries.length} participants
            </span>
          </div>
          <div className="space-y-2">
            {rest.map((entry) => (
              <RankingRow key={entry.userId} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
