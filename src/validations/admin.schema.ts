import { slugifyLessonId } from "@/lib/admin/lesson-video";

export type CreateModuleInput = {
  id: string;
  courseId: string;
  title: string;
  summary?: string;
  published?: boolean;
  sortOrder?: number;
};

export type UpdateModuleInput = Partial<Omit<CreateModuleInput, "id" | "courseId">>;

export function parseCreateModule(body: unknown): CreateModuleInput | null {
  if (!body || typeof body !== "object") return null;
  const r = body as Record<string, unknown>;

  const id = typeof r.id === "string" ? slugifyLessonId(r.id) : "";
  const courseId = typeof r.courseId === "string" ? r.courseId.trim().toLowerCase() : "";
  const title = typeof r.title === "string" ? r.title.trim() : "";

  if (!id || !courseId || !title) return null;

  return {
    id,
    courseId,
    title,
    summary: typeof r.summary === "string" ? r.summary.trim() : undefined,
    published: typeof r.published === "boolean" ? r.published : undefined,
    sortOrder: typeof r.sortOrder === "number" ? r.sortOrder : undefined,
  };
}

export function parseUpdateModule(body: unknown): UpdateModuleInput | null {
  if (!body || typeof body !== "object") return null;
  const r = body as Record<string, unknown>;
  const input: UpdateModuleInput = {};

  if (typeof r.title === "string") input.title = r.title.trim();
  if (typeof r.summary === "string") input.summary = r.summary.trim();
  if (typeof r.published === "boolean") input.published = r.published;
  if (typeof r.sortOrder === "number") input.sortOrder = r.sortOrder;

  return Object.keys(input).length > 0 ? input : null;
}
