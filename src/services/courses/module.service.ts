import { slugifyLessonId } from "@/lib/admin/lesson-video";
import { prisma } from "@/lib/db/prisma";
import type { CreateModuleInput, UpdateModuleInput } from "@/validations/admin.schema";

export type AdminModule = {
  id: string;
  courseId: string;
  title: string;
  summary: string;
  sortOrder: number;
  published: boolean;
  lessonCount: number;
};

async function resolveUniqueModuleId(courseId: string, preferredId: string): Promise<string> {
  const base = slugifyLessonId(preferredId) || "module";

  const orphans = await prisma.module.findMany({
    where: { courseId, lessons: { none: {} } },
    select: { id: true },
  });
  const orphanMatch = orphans.find((row) => slugifyLessonId(row.id) === base);
  if (orphanMatch) return orphanMatch.id;

  let candidate = base;
  let n = 2;
  while (await prisma.module.findUnique({ where: { id: candidate } })) {
    candidate = `${base}-${n++}`.slice(0, 80);
  }
  return candidate;
}

export async function listModulesByCourse(courseId: string): Promise<AdminModule[]> {
  const rows = await prisma.module.findMany({
    where: { courseId },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { lessons: true } } },
  });

  return rows.map((mod) => ({
    id: mod.id,
    courseId: mod.courseId,
    title: mod.title,
    summary: mod.summary ?? "",
    sortOrder: mod.sortOrder,
    published: mod.published,
    lessonCount: mod._count.lessons,
  }));
}

export async function getModule(moduleId: string): Promise<AdminModule | null> {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { _count: { select: { lessons: true } } },
  });
  if (!mod) return null;

  return {
    id: mod.id,
    courseId: mod.courseId,
    title: mod.title,
    summary: mod.summary ?? "",
    sortOrder: mod.sortOrder,
    published: mod.published,
    lessonCount: mod._count.lessons,
  };
}

export async function createModule(input: CreateModuleInput): Promise<AdminModule> {
  const moduleId = await resolveUniqueModuleId(input.courseId, input.id);
  const maxOrder = await prisma.module.aggregate({
    where: { courseId: input.courseId },
    _max: { sortOrder: true },
  });
  const sortOrder = input.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1;

  const existing = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { _count: { select: { lessons: true } } },
  });

  const mod = existing
    ? await prisma.module.update({
        where: { id: moduleId },
        data: {
          title: input.title,
          summary: input.summary,
          published: input.published ?? true,
          sortOrder: existing.sortOrder,
        },
        include: { _count: { select: { lessons: true } } },
      })
    : await prisma.module.create({
        data: {
          id: moduleId,
          courseId: input.courseId,
          title: input.title,
          summary: input.summary,
          published: input.published ?? true,
          sortOrder,
        },
        include: { _count: { select: { lessons: true } } },
      });

  return {
    id: mod.id,
    courseId: mod.courseId,
    title: mod.title,
    summary: mod.summary ?? "",
    sortOrder: mod.sortOrder,
    published: mod.published,
    lessonCount: mod._count.lessons,
  };
}

export async function updateModule(
  moduleId: string,
  input: UpdateModuleInput,
): Promise<AdminModule | null> {
  const existing = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!existing) return null;

  const mod = await prisma.module.update({
    where: { id: moduleId },
    data: {
      title: input.title,
      summary: input.summary,
      published: input.published,
      sortOrder: input.sortOrder,
    },
    include: { _count: { select: { lessons: true } } },
  });

  return {
    id: mod.id,
    courseId: mod.courseId,
    title: mod.title,
    summary: mod.summary ?? "",
    sortOrder: mod.sortOrder,
    published: mod.published,
    lessonCount: mod._count.lessons,
  };
}

export async function deleteModule(moduleId: string): Promise<boolean> {
  const existing = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!existing) return false;
  await prisma.module.delete({ where: { id: moduleId } });
  return true;
}

export async function reorderModules(
  courseId: string,
  orderedIds: string[],
): Promise<AdminModule[]> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.module.updateMany({
        where: { id, courseId },
        data: { sortOrder: index },
      }),
    ),
  );
  return listModulesByCourse(courseId);
}
