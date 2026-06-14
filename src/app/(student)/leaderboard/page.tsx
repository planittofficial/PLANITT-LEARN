import { LearnShell } from "@/components/layout/student";
import { EmptyState } from "@/components/shared";

export default function LeaderboardPage() {
  return (
    <LearnShell>
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <div className="mt-6">
        <EmptyState title="Leaderboard coming soon" description="Rankings will appear here once quiz APIs are wired." />
      </div>
    </LearnShell>
  );
}
