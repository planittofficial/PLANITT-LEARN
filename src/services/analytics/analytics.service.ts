import { prisma } from "@/lib/db/prisma";
import type { AnalyticsOverview } from "@/types/admin.types";
import { getPlatformOverview } from "@/services/analytics/overview.service";

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const overview = await getPlatformOverview();

  try {
    const [attempts, passedAttempts, enrollmentGroups, recentProgress] = await Promise.all([
      prisma.quizAttempt.count(),
      prisma.quizAttempt.count({ where: { passed: true } }),
      prisma.enrollment.groupBy({
        by: ["courseId"],
        _count: { courseId: true },
        orderBy: { _count: { courseId: "desc" } },
        take: 5,
      }),
      prisma.lessonProgress.findMany({
        orderBy: { lastWatchedAt: "desc" },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
          lesson: { select: { id: true, title: true } },
        },
      }),
    ]);

    const courseIds = enrollmentGroups.map((g) => g.courseId);
    const courses = courseIds.length
      ? await prisma.course.findMany({
          where: { id: { in: courseIds } },
          select: { id: true, title: true },
        })
      : [];
    const titleById = new Map(courses.map((c) => [c.id, c.title]));

    return {
      ...overview,
      quizAttempts: attempts,
      quizPassRate: attempts > 0 ? Math.round((passedAttempts / attempts) * 1000) / 10 : 0,
      popularCourses: enrollmentGroups.map((g) => ({
        courseId: g.courseId,
        title: titleById.get(g.courseId) ?? g.courseId,
        enrollmentCount: g._count.courseId,
      })),
      recentActivity: recentProgress.map((row) => ({
        userId: row.user.id,
        name: row.user.name ?? row.user.id,
        lessonId: row.lesson.id,
        lessonTitle: row.lesson.title,
        completed: row.completed,
        lastWatchedAt: row.lastWatchedAt.toISOString(),
      })),
    };
  } catch {
    return {
      ...overview,
      quizAttempts: 0,
      quizPassRate: 0,
      popularCourses: [],
      recentActivity: [],
    };
  }
}
