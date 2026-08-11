import type { LessonKind as PrismaLessonKind } from "@prisma/client";

import { normalizeCourseId } from "@/lib/api/path";
import { COURSE_CATALOG, countCourseLessons } from "@/lib/catalog/courses";
import { DatabaseError } from "@/lib/db/database-error";
import { prisma } from "@/lib/db/prisma";
import { getDatabaseUrl } from "@/lib/env";
import { isYoutubeUrl } from "@/lib/video/video-url";
import type {
  ApiAdminCourse,
  ApiCourseDetail,
  ApiCourseListItem,
  ApiLesson,
  ApiModule,
  LessonKind,
} from "@/types/course.types";

function toLessonKind(kind: PrismaLessonKind | string): LessonKind {
  if (kind === "video" || kind === "external") return kind;
  return "article";
}

function lessonFromStatic(lesson: (typeof COURSE_CATALOG)[0]["modules"][0]["lessons"][0]): ApiLesson {
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

function courseListFromStatic(): ApiCourseListItem[] {
  return COURSE_CATALOG.map((course) => ({
    id: course.id,
    title: course.title,
    category: course.category,
    level: course.level,
    duration: course.duration,
    blurb: course.blurb,
    outcomes: course.outcomes,
    moduleCount: course.modules.length,
    lessonCount: countCourseLessons(course),
  }));
}

function courseDetailFromStatic(courseId: string): ApiCourseDetail | null {
  const course = COURSE_CATALOG.find((c) => c.id === courseId);
  if (!course) return null;

  const modules: ApiModule[] = course.modules.map((mod) => ({
    id: mod.id,
    title: mod.title,
    summary: mod.summary,
    lessons: mod.lessons.map(lessonFromStatic),
  }));

  return {
    id: course.id,
    title: course.title,
    category: course.category,
    level: course.level,
    duration: course.duration,
    blurb: course.blurb,
    outcomes: course.outcomes,
    moduleCount: course.modules.length,
    lessonCount: countCourseLessons(course),
    modules,
  };
}

function lessonFromDb(row: {
  id: string;
  title: string;
  summary: string | null;
  kind: PrismaLessonKind;
  durationMinutes: number;
  minWatchPercent: number;
  markdown: string | null;
  videoUrl: string | null;
  externalUrl: string | null;
}): ApiLesson {
  let kind = toLessonKind(row.kind);
  let videoUrl = row.videoUrl ?? undefined;
  const externalUrl = row.externalUrl ?? undefined;

  if (!videoUrl && externalUrl && isYoutubeUrl(externalUrl)) {
    videoUrl = externalUrl;
    kind = "video";
  }

  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    kind,
    durationMinutes: row.durationMinutes,
    minWatchPercent: row.minWatchPercent,
    content: {
      markdown: row.markdown ?? undefined,
      videoUrl,
      externalUrl,
    },
  };
}

export async function listPublishedCourses(): Promise<ApiCourseListItem[]> {
  if (!getDatabaseUrl()) return courseListFromStatic();

  try {
    const rows = await prisma.course.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      include: {
        modules: {
          where: { published: true },
          include: { lessons: { where: { published: true } } },
        },
      },
    });

    if (rows.length === 0) return [];

    return rows.map((course) => {
      const lessonCount = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
      return {
        id: course.id,
        title: course.title,
        category: course.category,
        level: course.level,
        duration: course.duration ?? "",
        blurb: course.blurb ?? "",
        outcomes: Array.isArray(course.outcomes) ? (course.outcomes as string[]) : [],
        moduleCount: course.modules.length,
        lessonCount,
      };
    });
  } catch (error) {
    throw new DatabaseError(undefined, { cause: error });
  }
}

export async function getCourseDetail(courseId: string): Promise<ApiCourseDetail | null> {
  const normalized = normalizeCourseId(courseId);
  if (!getDatabaseUrl()) return courseDetailFromStatic(normalized);

  try {
    const course = await prisma.course.findFirst({
      where: { id: normalized, published: true },
      include: {
        modules: {
          where: { published: true },
          orderBy: { sortOrder: "asc" },
          include: {
            lessons: { where: { published: true }, orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (!course) return null;

    const modules: ApiModule[] = course.modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      summary: mod.summary ?? "",
      lessons: mod.lessons.map(lessonFromDb),
    }));

    const lessonCount = modules.reduce((sum, mod) => sum + mod.lessons.length, 0);

    return {
      id: course.id,
      title: course.title,
      category: course.category,
      level: course.level,
      duration: course.duration ?? "",
      blurb: course.blurb ?? "",
      outcomes: Array.isArray(course.outcomes) ? (course.outcomes as string[]) : [],
      moduleCount: modules.length,
      lessonCount,
      modules,
    };
  } catch (error) {
    console.error("[getCourseDetail] database error:", error);
    throw error;
  }
}

export async function listAdminCourses(): Promise<ApiAdminCourse[]> {
  if (!getDatabaseUrl()) {
    return courseListFromStatic().map((course, index) => ({
      ...course,
      published: true,
      sortOrder: index,
    }));
  }

  const rows = await prisma.course.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      modules: { include: { lessons: true } },
    },
  });

  return rows.map((course) => ({
    id: course.id,
    title: course.title,
    category: course.category,
    level: course.level,
    duration: course.duration ?? "",
    blurb: course.blurb ?? "",
    outcomes: Array.isArray(course.outcomes) ? (course.outcomes as string[]) : [],
    moduleCount: course.modules.length,
    lessonCount: course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0),
    published: course.published,
    sortOrder: course.sortOrder,
  }));
}

export async function createCourse(input: {
  id: string;
  title: string;
  category: string;
  level: string;
  blurb?: string;
  description?: string;
  duration?: string;
}): Promise<ApiAdminCourse> {
  const maxOrder = await prisma.course.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const course = await prisma.course.create({
    data: {
      id: input.id,
      title: input.title,
      category: input.category,
      level: input.level,
      blurb: input.blurb,
      description: input.description,
      duration: input.duration,
      published: false,
      sortOrder,
      outcomes: [],
    },
    include: { modules: { include: { lessons: true } } },
  });

  return {
    id: course.id,
    title: course.title,
    category: course.category,
    level: course.level,
    duration: course.duration ?? "",
    blurb: course.blurb ?? "",
    outcomes: [],
    moduleCount: 0,
    lessonCount: 0,
    published: course.published,
    sortOrder: course.sortOrder,
  };
}

export type AdminCourseDetail = ApiAdminCourse & {
  description: string;
  thumbnailUrl: string | null;
};

export async function getAdminCourse(courseId: string): Promise<AdminCourseDetail | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: true } } },
  });
  if (!course) return null;

  return {
    id: course.id,
    title: course.title,
    category: course.category,
    level: course.level,
    duration: course.duration ?? "",
    blurb: course.blurb ?? "",
    outcomes: Array.isArray(course.outcomes) ? (course.outcomes as string[]) : [],
    moduleCount: course.modules.length,
    lessonCount: course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0),
    published: course.published,
    sortOrder: course.sortOrder,
    description: course.description ?? "",
    thumbnailUrl: course.thumbnailUrl,
  };
}

export async function updateCourse(
  courseId: string,
  input: import("@/validations/course.schema").UpdateCourseInput,
): Promise<AdminCourseDetail | null> {
  const existing = await prisma.course.findUnique({ where: { id: courseId } });
  if (!existing) return null;

  const course = await prisma.course.update({
    where: { id: courseId },
    data: {
      title: input.title,
      category: input.category,
      level: input.level,
      blurb: input.blurb,
      description: input.description,
      duration: input.duration,
      thumbnailUrl: input.thumbnailUrl,
      outcomes: input.outcomes,
      published: input.published,
      sortOrder: input.sortOrder,
    },
    include: { modules: { include: { lessons: true } } },
  });

  return {
    id: course.id,
    title: course.title,
    category: course.category,
    level: course.level,
    duration: course.duration ?? "",
    blurb: course.blurb ?? "",
    outcomes: Array.isArray(course.outcomes) ? (course.outcomes as string[]) : [],
    moduleCount: course.modules.length,
    lessonCount: course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0),
    published: course.published,
    sortOrder: course.sortOrder,
    description: course.description ?? "",
    thumbnailUrl: course.thumbnailUrl,
  };
}

export async function deleteCourse(courseId: string): Promise<boolean> {
  const existing = await prisma.course.findUnique({ where: { id: courseId } });
  if (!existing) return false;
  await prisma.course.delete({ where: { id: courseId } });
  return true;
}
