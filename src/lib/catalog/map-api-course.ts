import type { CourseDefinition } from "@/lib/catalog/courses";
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
          videoAvailable: lesson.content.videoAvailable,
          externalUrl: lesson.content.externalUrl,
        },
      })),
    })),
  };
}

/** List item → CourseDefinition (metadata only — modules come from course detail API). */
export function apiCourseListItemToDefinition(item: ApiCourseListItem): CourseDefinition {
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
