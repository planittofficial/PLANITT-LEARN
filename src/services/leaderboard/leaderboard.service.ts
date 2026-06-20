import { prisma } from "@/lib/db/prisma";
import type { LeaderboardRow } from "@/types/quiz.types";

export async function computeLeaderboardForCourse(courseId: string): Promise<LeaderboardRow[]> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: { lessons: { select: { id: true } } },
      },
    },
  });
  if (!course) return [];

  const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const totalLessons = lessonIds.length;

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId },
    select: { userId: true, user: { select: { id: true, name: true } } },
  });

  const [progressRows, quizRows] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { lessonId: { in: lessonIds }, completed: true },
      select: { userId: true },
    }),
    prisma.quizAttempt.findMany({
      where: {
        OR: [
          { lessonId: { in: lessonIds } },
          { moduleId: { in: course.modules.map((m) => m.id) } },
        ],
      },
      select: { userId: true, score: true },
    }),
  ]);

  const completedByUser = new Map<string, number>();
  for (const row of progressRows) {
    completedByUser.set(row.userId, (completedByUser.get(row.userId) ?? 0) + 1);
  }

  const scoreByUser = new Map<string, number>();
  for (const row of quizRows) {
    scoreByUser.set(row.userId, (scoreByUser.get(row.userId) ?? 0) + row.score);
  }

  const rows: LeaderboardRow[] = enrollments.map((enrollment) => {
    const lessonsCompleted = completedByUser.get(enrollment.userId) ?? 0;
    const totalScore = scoreByUser.get(enrollment.userId) ?? 0;
    const completionPercent =
      totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 1000) / 10 : 0;

    return {
      rank: 0,
      userId: enrollment.user.id,
      name: enrollment.user.name ?? enrollment.user.id,
      totalScore,
      completionPercent,
      lessonsCompleted,
    };
  });

  rows.sort((a, b) => b.totalScore - a.totalScore || b.completionPercent - a.completionPercent);
  rows.forEach((row, index) => {
    row.rank = index + 1;
  });

  await prisma.$transaction(
    rows.map((row) =>
      prisma.leaderboardEntry.upsert({
        where: { userId_courseId: { userId: row.userId, courseId } },
        create: {
          userId: row.userId,
          courseId,
          totalScore: row.totalScore,
          completionPercent: row.completionPercent,
          lessonsCompleted: row.lessonsCompleted,
          rank: row.rank,
        },
        update: {
          totalScore: row.totalScore,
          completionPercent: row.completionPercent,
          lessonsCompleted: row.lessonsCompleted,
          rank: row.rank,
          computedAt: new Date(),
        },
      }),
    ),
  );

  return rows;
}

export async function getLeaderboard(courseId: string): Promise<LeaderboardRow[]> {
  const cached = await prisma.leaderboardEntry.findMany({
    where: { courseId },
    orderBy: [{ rank: "asc" }, { totalScore: "desc" }],
    include: { user: { select: { name: true } } },
    take: 100,
  });

  if (cached.length > 0) {
    return cached.map((row) => ({
      rank: row.rank ?? 0,
      userId: row.userId,
      name: row.user.name ?? row.userId,
      totalScore: row.totalScore,
      completionPercent: row.completionPercent,
      lessonsCompleted: row.lessonsCompleted,
    }));
  }

  return computeLeaderboardForCourse(courseId);
}
