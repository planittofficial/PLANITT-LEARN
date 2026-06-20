import { prisma } from "@/lib/db/prisma";
import type { AdminStudentDetail, AdminStudentSummary } from "@/types/admin.types";

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
