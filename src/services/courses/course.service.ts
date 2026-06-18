import type { LessonKind as PrismaLessonKind } from "@prisma/client";

import { COURSE_CATALOG, countCourseLessons } from "@/lib/catalog/courses";
import { prisma } from "@/lib/db/prisma";
import { getDatabaseUrl } from "@/lib/env";
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
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? "",
    kind: toLessonKind(row.kind),
    durationMinutes: row.durationMinutes,
    minWatchPercent: row.minWatchPercent,
    content: {
      markdown: row.markdown ?? undefined,
      videoUrl: row.videoUrl ?? undefined,
      externalUrl: row.externalUrl ?? undefined,
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

    if (rows.length === 0) return courseListFromStatic();

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
  } catch {
    return courseListFromStatic();
  }
}

export async function getCourseDetail(courseId: string): Promise<ApiCourseDetail | null> {
  const normalized = courseId.trim().toLowerCase();
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

    if (!course) return courseDetailFromStatic(normalized);

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
  } catch {
    return courseDetailFromStatic(normalized);
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
