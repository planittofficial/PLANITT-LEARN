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

export type UpdateCourseInput = {
  title?: string;
  category?: string;
  level?: string;
  blurb?: string;
  description?: string;
  duration?: string;
  thumbnailUrl?: string;
  outcomes?: string[];
  published?: boolean;
  sortOrder?: number;
};

export function parseUpdateCourse(body: unknown): UpdateCourseInput | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const input: UpdateCourseInput = {};

  if (typeof record.title === "string") input.title = record.title.trim();
  if (typeof record.category === "string") input.category = record.category.trim();
  if (typeof record.level === "string") input.level = record.level.trim();
  if (typeof record.blurb === "string") input.blurb = record.blurb.trim();
  if (typeof record.description === "string") input.description = record.description.trim();
  if (typeof record.duration === "string") input.duration = record.duration.trim();
  if (typeof record.thumbnailUrl === "string") input.thumbnailUrl = record.thumbnailUrl.trim();
  if (typeof record.published === "boolean") input.published = record.published;
  if (typeof record.sortOrder === "number") input.sortOrder = record.sortOrder;
  if (Array.isArray(record.outcomes)) {
    input.outcomes = record.outcomes
      .map((o) => (typeof o === "string" ? o.trim() : ""))
      .filter(Boolean);
  }

  return Object.keys(input).length > 0 ? input : null;
}
