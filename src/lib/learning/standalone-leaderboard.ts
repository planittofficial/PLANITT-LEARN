import type { LeaderboardRow } from "@/types/quiz.types";

/** Demo rankings for local/dev standalone when the DB leaderboard is unavailable. */
export function buildStandaloneLeaderboard(
  courseId: string,
  currentUser: { id: string; name: string },
): LeaderboardRow[] {
  const seed = courseId.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const peers: Omit<LeaderboardRow, "rank">[] = [
    {
      userId: "demo-learner-aria",
      name: "Aria Shah",
      totalScore: 820 + (seed % 40),
      completionPercent: 78,
      lessonsCompleted: 11,
    },
    {
      userId: "demo-learner-noah",
      name: "Noah Patel",
      totalScore: 640 + (seed % 55),
      completionPercent: 62,
      lessonsCompleted: 9,
    },
    {
      userId: "demo-learner-mia",
      name: "Mia Chen",
      totalScore: 510 + (seed % 30),
      completionPercent: 48,
      lessonsCompleted: 7,
    },
    {
      userId: "demo-learner-leo",
      name: "Leo Brooks",
      totalScore: 390 + (seed % 25),
      completionPercent: 35,
      lessonsCompleted: 5,
    },
    {
      userId: currentUser.id,
      name: currentUser.name || "You",
      totalScore: 280 + (seed % 20),
      completionPercent: 28,
      lessonsCompleted: 4,
    },
  ];

  return peers
    .sort((a, b) => b.totalScore - a.totalScore || b.completionPercent - a.completionPercent)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}
