import type { LessonKind } from "@/types/course.types";

export type CreateLessonInput = {
  id: string;
  moduleId: string;
  title: string;
  summary?: string;
  kind: LessonKind;
  durationMinutes?: number;
  durationSeconds?: number;
  minWatchPercent?: number;
  markdown?: string;
  videoUrl?: string;
  videoKey?: string;
  externalUrl?: string;
  published?: boolean;
  sortOrder?: number;
};

export type UpdateLessonInput = Partial<Omit<CreateLessonInput, "id" | "moduleId">>;

function parseKind(value: unknown): LessonKind | null {
  const k = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (k === "video" || k === "article" || k === "external") return k;
  return null;
}

export function parseCreateLesson(body: unknown): CreateLessonInput | null {
  if (!body || typeof body !== "object") return null;
  const r = body as Record<string, unknown>;

  const id = typeof r.id === "string" ? r.id.trim() : "";
  const moduleId = typeof r.moduleId === "string" ? r.moduleId.trim() : "";
  const title = typeof r.title === "string" ? r.title.trim() : "";
  const kind = parseKind(r.kind);

  if (!id || !moduleId || !title || !kind) return null;

  return {
    id,
    moduleId,
    title,
    kind,
    summary: typeof r.summary === "string" ? r.summary.trim() : undefined,
    durationMinutes: typeof r.durationMinutes === "number" ? r.durationMinutes : undefined,
    durationSeconds: typeof r.durationSeconds === "number" ? r.durationSeconds : undefined,
    minWatchPercent: typeof r.minWatchPercent === "number" ? r.minWatchPercent : undefined,
    markdown: typeof r.markdown === "string" ? r.markdown : undefined,
    videoUrl: typeof r.videoUrl === "string" ? r.videoUrl.trim() : undefined,
    videoKey: typeof r.videoKey === "string" ? r.videoKey.trim() : undefined,
    externalUrl: typeof r.externalUrl === "string" ? r.externalUrl.trim() : undefined,
    published: typeof r.published === "boolean" ? r.published : undefined,
    sortOrder: typeof r.sortOrder === "number" ? r.sortOrder : undefined,
  };
}

export function parseUpdateLesson(body: unknown): UpdateLessonInput | null {
  if (!body || typeof body !== "object") return null;
  const r = body as Record<string, unknown>;
  const kind = r.kind !== undefined ? parseKind(r.kind) : undefined;
  if (r.kind !== undefined && !kind) return null;

  const input: UpdateLessonInput = {};
  if (typeof r.title === "string") input.title = r.title.trim();
  if (typeof r.summary === "string") input.summary = r.summary.trim();
  if (kind) input.kind = kind;
  if (typeof r.durationMinutes === "number") input.durationMinutes = r.durationMinutes;
  if (typeof r.durationSeconds === "number") input.durationSeconds = r.durationSeconds;
  if (typeof r.minWatchPercent === "number") input.minWatchPercent = r.minWatchPercent;
  if (typeof r.markdown === "string") input.markdown = r.markdown;
  if (typeof r.videoUrl === "string") input.videoUrl = r.videoUrl.trim();
  if (typeof r.videoKey === "string") input.videoKey = r.videoKey.trim();
  if (typeof r.externalUrl === "string") input.externalUrl = r.externalUrl.trim();
  if (typeof r.published === "boolean") input.published = r.published;
  if (typeof r.sortOrder === "number") input.sortOrder = r.sortOrder;

  return Object.keys(input).length > 0 ? input : null;
}
