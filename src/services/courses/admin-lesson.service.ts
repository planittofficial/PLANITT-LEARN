import type { LessonKind as PrismaLessonKind } from "@prisma/client";

import { slugifyLessonId } from "@/lib/admin/lesson-video";
import { prisma } from "@/lib/db/prisma";
import type { LessonKind } from "@/types/course.types";
import type { CreateLessonInput, UpdateLessonInput } from "@/validations/lesson.schema";

export type AdminLesson = {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  summary: string;
  kind: LessonKind;
  sortOrder: number;
  durationMinutes: number;
  durationSeconds: number | null;
  minWatchPercent: number;
  videoKey: string | null;
  videoUrl: string | null;
  markdown: string | null;
  externalUrl: string | null;
  published: boolean;
};

function toAdminLesson(row: {
  id: string;
  moduleId: string;
  title: string;
  summary: string | null;
  kind: PrismaLessonKind;
  sortOrder: number;
  durationMinutes: number;
  durationSeconds: number | null;
  minWatchPercent: number;
  videoKey: string | null;
  videoUrl: string | null;
  markdown: string | null;
  externalUrl: string | null;
  published: boolean;
  module: { courseId: string };
}): AdminLesson {
  return {
    id: row.id,
    moduleId: row.moduleId,
    courseId: row.module.courseId,
    title: row.title,
    summary: row.summary ?? "",
    kind: row.kind as LessonKind,
    sortOrder: row.sortOrder,
    durationMinutes: row.durationMinutes,
    durationSeconds: row.durationSeconds,
    minWatchPercent: row.minWatchPercent,
    videoKey: row.videoKey,
    videoUrl: row.videoUrl,
    markdown: row.markdown,
    externalUrl: row.externalUrl,
    published: row.published,
  };
}

export async function listLessonsByModule(moduleId: string): Promise<AdminLesson[]> {
  const rows = await prisma.lesson.findMany({
    where: { moduleId },
    orderBy: { sortOrder: "asc" },
    include: { module: { select: { courseId: true } } },
  });
  return rows.map(toAdminLesson);
}

export async function getAdminLesson(lessonId: string): Promise<AdminLesson | null> {
  const row = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { select: { courseId: true } } },
  });
  return row ? toAdminLesson(row) : null;
}

async function resolveUniqueLessonId(preferredId: string): Promise<string> {
  const base = slugifyLessonId(preferredId) || "lesson";
  let candidate = base;
  let n = 2;
  while (await prisma.lesson.findUnique({ where: { id: candidate } })) {
    candidate = `${base}-${n++}`.slice(0, 80);
  }
  return candidate;
}

export async function createLesson(input: CreateLessonInput): Promise<AdminLesson> {
  const lessonId = await resolveUniqueLessonId(input.id);
  const maxOrder = await prisma.lesson.aggregate({
    where: { moduleId: input.moduleId },
    _max: { sortOrder: true },
  });
  const sortOrder = input.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1;
  const published = input.published ?? true;

  const row = await prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.create({
      data: {
        id: lessonId,
        moduleId: input.moduleId,
        title: input.title,
        summary: input.summary,
        kind: input.kind,
        durationMinutes: input.durationMinutes ?? 10,
        durationSeconds: input.durationSeconds,
        minWatchPercent: input.minWatchPercent ?? 75,
        markdown: input.markdown,
        videoUrl: input.videoUrl,
        videoKey: input.videoKey,
        externalUrl: input.externalUrl,
        published,
        sortOrder,
      },
      include: { module: { select: { courseId: true } } },
    });

    if (published) {
      await tx.module.update({
        where: { id: input.moduleId },
        data: { published: true },
      });
    }

    return lesson;
  });

  return toAdminLesson(row);
}

export async function updateLesson(
  lessonId: string,
  input: UpdateLessonInput,
): Promise<AdminLesson | null> {
  const existing = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!existing) return null;

  const published = input.published ?? existing.published;

  const row = await prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.update({
      where: { id: lessonId },
      data: {
        title: input.title,
        summary: input.summary,
        kind: input.kind,
        durationMinutes: input.durationMinutes,
        durationSeconds: input.durationSeconds,
        minWatchPercent: input.minWatchPercent,
        markdown: input.markdown,
        videoUrl: input.videoUrl,
        videoKey: input.videoKey,
        externalUrl: input.externalUrl,
        published: input.published,
        sortOrder: input.sortOrder,
      },
      include: { module: { select: { courseId: true } } },
    });

    if (published) {
      await tx.module.update({
        where: { id: existing.moduleId },
        data: { published: true },
      });
    }

    return lesson;
  });

  return toAdminLesson(row);
}

export async function deleteLesson(lessonId: string): Promise<boolean> {
  const existing = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!existing) return false;
  await prisma.lesson.delete({ where: { id: lessonId } });
  return true;
}

export async function reorderLessons(
  moduleId: string,
  orderedIds: string[],
): Promise<AdminLesson[]> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.lesson.updateMany({
        where: { id, moduleId },
        data: { sortOrder: index },
      }),
    ),
  );
  return listLessonsByModule(moduleId);
}
