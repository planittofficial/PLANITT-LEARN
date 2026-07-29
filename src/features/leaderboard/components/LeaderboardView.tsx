"use client";

import { Medal, Trophy, ArrowUpRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { LeaderboardEmpty } from "@/components/shared/EmptyState";
import { useLeaderboard, type LeaderboardEntry } from "@/hooks/leaderboard/use-leaderboard";
import { cn } from "@/lib/utils";

function getMockYield(score: number): string {
  const base = 5.25;
  const growth = score / 200;
  return `+${(base + growth).toFixed(2)}%`;
}

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: number }) {
  const borderColors = [
    "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.12)] bg-[#131313]/80",
    "border-slate-400/20 shadow-[0_0_15px_rgba(156,163,175,0.08)] bg-[#131313]/60",
    "border-orange-500/20 shadow-[0_0_15px_rgba(217,119,6,0.08)] bg-[#131313]/60",
  ];
  
  const initials = entry.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  const yieldPct = getMockYield(entry.totalScore);

  const titleBadges = ["Market King 👑", "Trend Runner 📈", "Profit Scalper 📊"];
  const title = titleBadges[place] || "Prop Trader";

  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border p-6 text-center transition-all duration-300 relative overflow-hidden group hover:border-brand/40",
        borderColors[place],
        entry.isCurrentUser && "ring-1 ring-brand"
      )}
    >
      <div className="glow-border" />
      {/* Dynamic Grid Background in Podium Card */}
      <div className="absolute inset-0 radar-grid opacity-10 pointer-events-none" />

      {/* Glowing Avatar */}
      <div className="relative mb-4 z-10">
        <div className={cn(
          "h-16 w-16 rounded-full flex items-center justify-center font-bold text-lg border font-mono",
          place === 0 
            ? "bg-amber-500/10 border-amber-500/40 text-amber-400" 
            : place === 1 
              ? "bg-slate-400/10 border-slate-400/30 text-slate-300"
              : "bg-orange-500/10 border-orange-500/30 text-orange-400"
        )}>
          {initials}
        </div>
        <span className="absolute -bottom-1 -right-1 text-[9px] bg-black border border-white/10 px-2 py-0.5 rounded font-mono font-bold leading-none text-textPrimary">
          #{place + 1}
        </span>
      </div>

      <p className="font-headline text-lg font-bold text-textPrimary truncate w-full z-10">{entry.name}</p>
      <p className="font-mono text-[9px] text-brand/60 uppercase tracking-widest font-bold mt-1 z-10">{title}</p>
      
      <div className="mt-4 flex flex-col items-center z-10">
        <span className="font-mono text-3xl font-extrabold text-brand tracking-tighter leading-none">
          {entry.totalScore.toLocaleString()}
        </span>
        <span className="font-mono text-[9px] text-textMuted uppercase tracking-widest font-bold mt-1.5">Score Points</span>
      </div>

      <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-sm z-10">
        <ArrowUpRight className="h-3.5 w-3.5" />
        <span>YIELD: {yieldPct}</span>
      </div>
    </div>
  );
}

function RankingRow({ entry }: { entry: LeaderboardEntry }) {
  const initials = entry.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  const yieldPct = getMockYield(entry.totalScore);
  
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md px-5 py-4 transition-all duration-200 hover:border-brand/40 relative overflow-hidden group",
        entry.isCurrentUser && "border-brand/30 bg-brand/5 shadow-[0_0_12px_rgba(20,184,166,0.05)]",
      )}
    >
      <div className="glow-border" />
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded font-mono text-xs font-bold border relative z-10",
          entry.rank <= 3 
            ? "bg-brand/10 border-brand/20 text-brand" 
            : "bg-[#1C1B1B] border-white/5 text-textSecondary",
        )}
      >
        {String(entry.rank).padStart(2, '0')}
      </span>
      
      {/* Avatar in list */}
      <div className="h-10 w-10 rounded-full bg-[#1C1B1B] border border-white/5 flex items-center justify-center font-mono font-bold text-xs text-textSecondary shrink-0 relative z-10">
        {initials}
      </div>

      <div className="min-w-0 flex-1 relative z-10">
        <p className="flex items-center gap-2 font-headline font-bold text-textPrimary text-sm">
          {entry.name}
          {entry.isCurrentUser ? (
            <span className="rounded bg-brand/10 border border-brand/25 px-2 py-0.5 text-[9px] font-bold text-brand uppercase font-mono tracking-wider">
              YOU
            </span>
          ) : null}
        </p>
        <p className="font-mono text-[9px] text-textSecondary uppercase tracking-wider mt-1">
          {entry.lessonsCompleted} lessons complete // yield {yieldPct}
        </p>
      </div>

      <div className="text-right relative z-10">
        <p className="font-mono text-base font-extrabold text-brand tracking-tighter leading-none">{entry.totalScore.toLocaleString()}</p>
        <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest font-bold mt-1">PTS</p>
      </div>
    </div>
  );
}

export function LeaderboardView() {
  const { entries, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-lg" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
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
    <div className="space-y-8 animate-in fade-in">
      {/* Header section */}
      <section className="relative overflow-hidden rounded-lg border border-white/5 bg-[#131313]/60 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-brand/40 uppercase tracking-widest">
          SYNC: LIVE
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-[1.5px] bg-brand"></span>
          <span className="font-mono text-[9px] text-brand uppercase tracking-widest font-bold">NETWORK_RANKINGS</span>
        </div>
        <h1 className="font-headline text-3xl font-extrabold text-textPrimary tracking-tight uppercase">
          Wall Street Leaderboard
        </h1>
        <p className="mt-2 max-w-xl text-xs text-textSecondary leading-relaxed">
          Top performing traders based on lesson execution matrix, module points, and yield index metrics.
        </p>
      </section>

      {/* Podium grid */}
      <div className="grid gap-6 sm:grid-cols-3 items-end pt-4">
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
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2 border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Medal className="h-4 w-4 text-brand" />
              <span className="font-headline text-base font-bold text-textPrimary uppercase tracking-wider">All Rankings</span>
            </div>
            <span className="font-mono text-[10px] text-textSecondary uppercase tracking-widest font-bold">
              {entries.length} participants
            </span>
          </div>
          <div className="space-y-3">
            {rest.map((entry) => (
              <RankingRow key={entry.userId} entry={entry} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
