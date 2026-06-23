"use client";

import { Trophy } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  AdminCard,
  AdminPageHeader,
  AdminPageSkeleton,
} from "@/features/admin-ui";
import { useLeaderboard } from "@/hooks/leaderboard/use-leaderboard";

export function LeaderboardAdminView() {
  const { entries, isLoading, isMock } = useLeaderboard("learn-forex-master-track");

  if (isLoading) return <AdminPageSkeleton />;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Rankings"
        title="Leaderboard"
        description="Top learners for the Forex Master Track course."
        icon={Trophy}
      />

      {isMock ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Showing fallback data — no live rankings yet.
        </div>
      ) : null}

      <div className="space-y-3">
        {entries.map((row) => (
          <AdminCard
            key={row.userId}
            className="flex flex-wrap items-center justify-between gap-4 !p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold ${
                  row.rank <= 3
                    ? "bg-gradient-to-br from-amber-500/20 to-violet-500/20 text-amber-300"
                    : "bg-overlay-hover text-textMuted"
                }`}
              >
                #{row.rank}
              </div>
              <Avatar name={row.name} size="sm" highlight={row.rank <= 3} />
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-textMuted">{row.completionPercent}% complete</p>
              </div>
            </div>
            <Badge variant={row.rank <= 10 ? "brand" : "muted"}>
              {row.totalScore.toLocaleString()} pts
            </Badge>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
