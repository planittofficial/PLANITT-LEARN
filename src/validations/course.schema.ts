export type CreateCourseInput = {
  id: string;
  title: string;
  category: string;
  level: string;
  blurb?: string;
  description?: string;
  duration?: string;
};

export function parseCreateCourse(body: unknown): CreateCourseInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id.trim().toLowerCase() : "";
  const title = typeof record.title === "string" ? record.title.trim() : "";
  const category = typeof record.category === "string" ? record.category.trim() : "";
  const level = typeof record.level === "string" ? record.level.trim() : "";

  if (!id || !id.startsWith("learn-") || !title || !category || !level) return null;

  const blurb = typeof record.blurb === "string" ? record.blurb.trim() : undefined;
  const description =
    typeof record.description === "string" ? record.description.trim() : undefined;
  const duration = typeof record.duration === "string" ? record.duration.trim() : undefined;

  return { id, title, category, level, blurb, description, duration };
}
