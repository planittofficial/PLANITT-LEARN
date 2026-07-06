import { Trophy } from "lucide-react";

import { LeaderboardView } from "@/features/leaderboard";

export default function LeaderboardPage() {
  return (
    <>
      <header className="mb-8">
        <div className="flex items-center gap-2 text-brand">
          <Trophy className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-widest">Rankings</span>
        </div>
        <h1 className="mt-3 text-3xl font-bold">Leaderboard</h1>
        <p className="mt-2 max-w-xl text-sm text-textSecondary">
          See how you compare with other learners. Complete lessons and quizzes to earn points and
          climb the ranks.
        </p>
      </header>
      <LeaderboardView />
    </>
  );
}
