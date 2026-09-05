import { prisma } from "@/lib/db/prisma";
import type { AdminStudentDetail, AdminStudentSummary } from "@/types/admin.types";
import type { SubscriptionSummary } from "@/types/admin.types";

const EXPIRING_SOON_MS = 7 * 24 * 60 * 60 * 1000;

function subscriptionSummary(expiresAt: Date | null | undefined, now = new Date()): SubscriptionSummary {
  if (!expiresAt) return { status: "none", expiresAt: null };
  const expiry = expiresAt.getTime();
  return {
    status: expiry <= now.getTime() ? "expired" : expiry <= now.getTime() + EXPIRING_SOON_MS ? "expiring_soon" : "active",
    expiresAt: expiresAt.toISOString(),
  };
}

export type PaginatedStudents = {
  items: AdminStudentSummary[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listStudents(params: {
  page: number;
  pageSize: number;
  skip: number;
  search?: string;
}): Promise<PaginatedStudents> {
  const where = params.search
    ? {
        OR: [
          { email: { contains: params.search, mode: "insensitive" as const } },
          { name: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: params.skip,
      take: params.pageSize,
      include: {
        _count: {
          select: {
            enrollments: true,
            lessonProgress: { where: { completed: true } },
            quizAttempts: true,
          },
        },
        subscription: { select: { expiresAt: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: rows.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      enrolledCourseCount: user._count.enrollments,
      lessonsCompleted: user._count.lessonProgress,
      quizAttempts: user._count.quizAttempts,
      createdAt: user.createdAt.toISOString(),
      subscription: subscriptionSummary(user.subscription?.expiresAt),
    })),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

export async function getStudentDetail(userId: string): Promise<AdminStudentDetail | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      enrollments: {
        include: { course: { select: { title: true } } },
        orderBy: { enrolledAt: "desc" },
      },
      lessonProgress: {
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              module: { select: { courseId: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      },
      quizAttempts: { orderBy: { attemptedAt: "desc" }, take: 50 },
      _count: {
        select: {
          enrollments: true,
          lessonProgress: { where: { completed: true } },
          quizAttempts: true,
        },
      },
      subscription: { select: { expiresAt: true } },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    enrolledCourseCount: user._count.enrollments,
    lessonsCompleted: user._count.lessonProgress,
    quizAttempts: user._count.quizAttempts,
    createdAt: user.createdAt.toISOString(),
    subscription: subscriptionSummary(user.subscription?.expiresAt),
    enrollments: user.enrollments.map((e) => ({
      courseId: e.courseId,
      courseTitle: e.course.title,
      enrolledAt: e.enrolledAt.toISOString(),
    })),
    progress: user.lessonProgress.map((p) => ({
      lessonId: p.lesson.id,
      lessonTitle: p.lesson.title,
      courseId: p.lesson.module.courseId,
      watchPercent: p.watchPercent,
      completed: p.completed,
    })),
    quizResults: user.quizAttempts.map((a) => ({
      id: a.id,
      type: a.attemptType === "lesson" ? "lesson" : "module",
      score: a.score,
      maxScore: a.maxScore,
      passed: a.passed,
      attemptedAt: a.attemptedAt.toISOString(),
    })),
  };
}

export type SubscriptionGrant = { userIds: string[]; mode: "days" | "date"; days?: number; date?: string };

export async function grantSubscriptions(input: SubscriptionGrant): Promise<number> {
  const now = new Date();
  const expiresAt = input.mode === "date" ? new Date(input.date as string) : null;
  if (input.mode === "date") {
    if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt <= now) throw new Error("Date must be in the future");
  }
  const users = await prisma.user.findMany({ where: { id: { in: input.userIds } }, select: { id: true, subscription: { select: { expiresAt: true } } } });
  if (users.length !== input.userIds.length) throw new Error("One or more users were not found");
  await prisma.$transaction(users.map((user) => {
    const nextExpiry = expiresAt ?? new Date(Math.max(now.getTime(), user.subscription?.expiresAt.getTime() ?? 0) + (input.days as number) * 24 * 60 * 60 * 1000);
    return prisma.subscription.upsert({ where: { userId: user.id }, create: { userId: user.id, expiresAt: nextExpiry }, update: { expiresAt: nextExpiry } });
  }));
  return users.length;
}
