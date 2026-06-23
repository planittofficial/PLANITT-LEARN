import type { CourseDefinition } from "@/lib/catalog/courses";
import { getCourseById } from "@/lib/catalog/courses";
import type { ApiCourseDetail, ApiCourseListItem } from "@/types/course.types";

/** Map API course detail to the student-facing CourseDefinition shape. */
export function apiCourseDetailToDefinition(api: ApiCourseDetail): CourseDefinition {
  return {
    id: api.id,
    title: api.title,
    category: api.category,
    level: api.level,
    duration: api.duration,
    blurb: api.blurb,
    outcomes: api.outcomes,
    modules: api.modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      summary: mod.summary,
      lessons: mod.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
        kind: lesson.kind,
        summary: lesson.summary,
        content: {
          markdown: lesson.content.markdown,
          videoUrl: lesson.content.videoUrl,
          externalUrl: lesson.content.externalUrl,
        },
      })),
    })),
  };
}

/** List item → CourseDefinition using static catalog modules when API has counts only. */
export function apiCourseListItemToDefinition(item: ApiCourseListItem): CourseDefinition {
  const staticCourse = getCourseById(item.id);
  if (staticCourse) {
    return {
      ...staticCourse,
      title: item.title,
      category: item.category,
      level: item.level,
      duration: item.duration,
      blurb: item.blurb,
      outcomes: item.outcomes,
    };
  }

  return {
    id: item.id,
    title: item.title,
    category: item.category,
    level: item.level,
    duration: item.duration,
    blurb: item.blurb,
    outcomes: item.outcomes,
    modules: [],
  };
}
