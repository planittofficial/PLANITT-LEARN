import { COURSE_CATALOG } from "@/lib/catalog/courses";
import { DatabaseError } from "@/lib/db/database-error";
import { prisma } from "@/lib/db/prisma";
import { getDatabaseUrl } from "@/lib/env";
import { isYoutubeUrl } from "@/lib/video/video-url";
import type { ApiLesson, LessonKind } from "@/types/course.types";

export type LessonContext = {
  lesson: ApiLesson;
  moduleId: string;
  courseId: string;
};

function fromCatalogLesson(
  lesson: (typeof COURSE_CATALOG)[number]["modules"][number]["lessons"][number],
): ApiLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary,
    kind: lesson.kind,
    durationMinutes: lesson.durationMinutes,
    minWatchPercent: 75,
    content: {
      markdown: lesson.content.markdown,
      videoUrl: lesson.content.videoUrl,
      externalUrl: lesson.content.externalUrl,
    },
  };
}

function resolveFromCatalog(lessonId: string): LessonContext | null {
  for (const course of COURSE_CATALOG) {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return {
          lesson: fromCatalogLesson(lesson),
          moduleId: mod.id,
          courseId: course.id,
        };
      }
    }
  }
  return null;
}

export async function getLessonContext(lessonId: string): Promise<LessonContext | null> {
  const normalized = lessonId.trim();
  if (!normalized) return null;

  if (!getDatabaseUrl()) return resolveFromCatalog(normalized);

  try {
    const row = await prisma.lesson.findUnique({
      where: { id: normalized },
      include: { module: { select: { id: true, courseId: true } } },
    });

    if (!row || !row.published) return null;

    let kind = row.kind as LessonKind;
    let videoUrl = row.videoUrl ?? undefined;
    const externalUrl = row.externalUrl ?? undefined;
    if (!videoUrl && externalUrl && isYoutubeUrl(externalUrl)) {
      videoUrl = externalUrl;
      kind = "video";
    }

    return {
      lesson: {
        id: row.id,
        title: row.title,
        summary: row.summary ?? "",
        kind,
        durationMinutes: row.durationMinutes,
        minWatchPercent: row.minWatchPercent,
        content: {
          markdown: row.markdown ?? undefined,
          videoAvailable: Boolean(videoUrl),
          externalUrl: externalUrl && !isYoutubeUrl(externalUrl) ? externalUrl : undefined,
        },
      },
      moduleId: row.module.id,
      courseId: row.module.courseId,
    };
  } catch (error) {
    throw new DatabaseError(undefined, { cause: error });
  }
}

export async function getCourseIdForLesson(lessonId: string): Promise<string | null> {
  const ctx = await getLessonContext(lessonId);
  return ctx?.courseId ?? null;
}
