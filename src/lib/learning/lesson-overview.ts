import type { CourseDefinition, CourseModule, Lesson } from "@/lib/catalog/courses";

export type LessonOverviewContent = {
  about: string;
  objectives: string[];
  hasMarkdown: boolean;
};

function firstNonEmpty(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/** Build student-facing lesson copy from lesson, module, and course metadata. */
export function buildLessonOverviewContent(
  lesson: Lesson,
  module: CourseModule,
  course: CourseDefinition,
): LessonOverviewContent {
  const about = firstNonEmpty(lesson.summary, module.summary, course.blurb);

  const objectives: string[] = [];
  if (lesson.content.markdown?.trim()) {
    const bulletLines = lesson.content.markdown
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- "))
      .map((line) => line.replace(/^-\s*/, "").trim())
      .filter(Boolean);
    objectives.push(...bulletLines.slice(0, 6));
  }

  if (objectives.length === 0) {
    objectives.push(
      ...course.outcomes.slice(0, 3).map((outcome) => outcome.trim()).filter(Boolean),
    );
  }

  if (objectives.length === 0 && about) {
    objectives.push(`Understand the core ideas covered in “${lesson.title}”.`);
    objectives.push(`Apply concepts from ${module.title} in practical market scenarios.`);
  }

  return {
    about,
    objectives,
    hasMarkdown: Boolean(lesson.content.markdown?.trim()),
  };
}
