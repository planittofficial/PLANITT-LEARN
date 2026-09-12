import { COURSE_CATALOG_DATA } from "./course-content";

export type LessonKind = "video" | "article" | "external";

export type Lesson = {
  id: string;
  title: string;
  durationMinutes: number;
  kind: LessonKind;
  summary: string;
  content: {
    videoUrl?: string;
    videoAvailable?: boolean;
    markdown?: string;
    externalUrl?: string;
  };
};

export type CourseModule = {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
  hasModuleTest?: boolean;
};

export type CourseDefinition = {
  /** Must match appbackend plan_id e.g. learn-forex-master-track */
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  blurb: string;
  outcomes: string[];
  modules: CourseModule[];
};

export const COMBO_PLAN_ID = "learn-all-courses-combo";

export const ALL_COURSE_IDS = [
  "learn-indian-stocks-pro",
  "learn-forex-master-track",
  "learn-fno-strategy-program",
  "learn-crypto-technical-edge",
  "learn-trader-psychology-intensive",
  "learn-algo-trading",
] as const;

/** All Alvest Learn courses — interns extend content in course-content.ts */
export const COURSE_CATALOG: CourseDefinition[] = COURSE_CATALOG_DATA;

export function getCourseById(courseId: string): CourseDefinition | undefined {
  return COURSE_CATALOG.find((c) => c.id === courseId);
}

export function countCourseLessons(course: CourseDefinition): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export function getLessonByPath(
  courseId: string,
  moduleId: string,
  lessonId: string,
): { course: CourseDefinition; module: CourseModule; lesson: Lesson } | null {
  const course = getCourseById(courseId);
  if (!course) return null;
  const module = course.modules.find((m) => m.id === moduleId);
  if (!module) return null;
  const lesson = module.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  return { course, module, lesson };
}

export function getAdjacentLessons(
  courseId: string,
  moduleId: string,
  lessonId: string,
): {
  prev: { moduleId: string; lessonId: string; title: string } | null;
  next: { moduleId: string; lessonId: string; title: string } | null;
} {
  const course = getCourseById(courseId);
  if (!course) return { prev: null, next: null };

  const flat: { moduleId: string; lessonId: string; title: string }[] = [];
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      flat.push({ moduleId: mod.id, lessonId: lesson.id, title: lesson.title });
    }
  }

  const idx = flat.findIndex((l) => l.moduleId === moduleId && l.lessonId === lessonId);
  if (idx === -1) return { prev: null, next: null };

  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
