import type { LessonKind } from "@/types/course.types";
import { isYoutubeUrl } from "@/lib/video/video-url";

const EXTERNAL_HOST_PATTERN =
  /youtube\.com|youtu\.be|vimeo\.com|drive\.google\.com|loom\.com|wistia\.com/i;

export function slugifyLessonId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function defaultLessonId(moduleId: string, existingCount = 0): string {
  const base = slugifyLessonId(moduleId) || "module";
  const suffix = existingCount > 0 ? `-${existingCount + 1}` : "";
  return `${base}-lecture${suffix}`;
}

export function inferLessonVideoFields(url: string): {
  kind: LessonKind;
  videoUrl?: string;
  externalUrl?: string;
} {
  const trimmed = url.trim();
  if (!trimmed) return { kind: "video" };

  // YouTube/Vimeo play inline in the lesson player — store as hosted video URL.
  if (isYoutubeUrl(trimmed) || /vimeo\.com/i.test(trimmed)) {
    return { kind: "video", videoUrl: trimmed };
  }

  if (EXTERNAL_HOST_PATTERN.test(trimmed)) {
    return { kind: "external", externalUrl: trimmed };
  }

  return { kind: "video", videoUrl: trimmed };
}

export async function parseApiError(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: string; message?: string };
    return data.detail ?? data.message ?? fallback;
  } catch {
    return fallback;
  }
}
