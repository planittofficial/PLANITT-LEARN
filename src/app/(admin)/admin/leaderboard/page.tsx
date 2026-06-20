"use client";

import { useLeaderboard } from "@/hooks/leaderboard/use-leaderboard";

export default function Page() {
  const { entries, isLoading, isMock } = useLeaderboard("learn-forex-master-track");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      {isMock ? <p className="text-sm text-textMuted">Showing fallback data — no live rankings yet.</p> : null}
      {isLoading ? <p>Loading…</p> : null}
      <div className="space-y-2">
        {entries.map((row) => (
          <div key={row.userId} className="flex items-center justify-between rounded-xl border border-borderSubtle px-4 py-3 text-sm">
            <span>#{row.rank} {row.name}</span>
            <span className="text-textSecondary">{row.totalScore} pts · {row.completionPercent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
