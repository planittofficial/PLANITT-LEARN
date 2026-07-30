"use client";

import Link from "next/link";
import { Trophy, Medal, TrendingUp } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import {
  AdminPageHeader,
  AdminPageSkeleton,
} from "@/features/admin-ui";
import { useLeaderboard } from "@/hooks/leaderboard/use-leaderboard";

export function LeaderboardAdminView() {
  const { entries, isLoading } = useLeaderboard("learn-forex-master-track");

  if (isLoading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in">
      <AdminPageHeader
        eyebrow="Network Rankings"
        title="Platform Leaderboard"
        description="Top performing learners across all enrolled courses — sorted by total score and completion rate."
        icon={Trophy}
      />

      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-white/10 px-6 py-12 text-center font-mono text-xs text-textMuted uppercase tracking-wider">
          No leaderboard entries yet. Learners appear after completing lessons and quizzes.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((row) => {
            const initials = row.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
            return (
              <div
                key={row.userId}
                className={`flex items-center justify-between gap-4 rounded-lg border px-5 py-4 backdrop-blur-md transition hover:border-brand/40 ${row.rank <= 3 ? "border-amber-500/20 bg-amber-500/5" : "border-white/5 bg-[#131313]/60"}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank Badge */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded font-mono text-sm font-black border ${row.rank <= 3 ? "border-amber-500/30 bg-amber-500/10 text-amber-400" : "border-white/5 bg-[#1C1B1B] text-textSecondary"}`}>
                    #{row.rank}
                  </div>
                  {/* Avatar circle */}
                  <div className="h-10 w-10 rounded-full bg-[#1C1B1B] border border-white/5 flex items-center justify-center font-mono font-bold text-xs text-brand shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-textPrimary text-xs uppercase tracking-wide">{row.name}</p>
                    <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest mt-0.5">
                      {row.lessonsCompleted} lessons // {row.completionPercent}% complete
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-mono text-base font-extrabold text-brand leading-none tracking-tighter">
                    {row.totalScore.toLocaleString()}
                  </p>
                  <p className="font-mono text-[9px] text-textMuted uppercase tracking-widest mt-1">Points</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
