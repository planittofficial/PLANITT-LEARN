import { COURSE_CATALOG } from "@/lib/catalog/courses";
import { prisma } from "@/lib/db/prisma";
import { getDatabaseUrl } from "@/lib/env";
import { isYoutubeUrl } from "@/lib/video/video-url";
import {
  buildSecureYoutubeEmbedUrl,
  getYoutubeVideoId,
  youtubeThumbnailUrl,
} from "@/lib/video/youtube-embed";

export type LessonPlayback =
  | {
      provider: "youtube";
      embedUrl: string;
      thumbnailUrl: string;
    }
  | {
      provider: "hosted";
      streamUrl: string;
    };

function playbackFromCatalog(lessonId: string): LessonPlayback | null {
  for (const course of COURSE_CATALOG) {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (!lesson) continue;

      const rawUrl = lesson.content.videoUrl?.trim();
      if (!rawUrl) return null;

      if (isYoutubeUrl(rawUrl)) {
        const videoId = getYoutubeVideoId(rawUrl);
        if (!videoId) return null;
        return {
          provider: "youtube",
          embedUrl: buildSecureYoutubeEmbedUrl(videoId),
          thumbnailUrl: youtubeThumbnailUrl(videoId),
        };
      }

      return { provider: "hosted", streamUrl: rawUrl };
    }
  }
  return null;
}

export async function getLessonPlayback(lessonId: string): Promise<LessonPlayback | null> {
  const normalized = lessonId.trim();
  if (!normalized) return null;

  if (!getDatabaseUrl()) return playbackFromCatalog(normalized);

  const row = await prisma.lesson.findUnique({
    where: { id: normalized },
    select: {
      published: true,
      videoUrl: true,
      externalUrl: true,
    },
  });

  if (!row?.published) return null;

  const rawUrl = row.videoUrl?.trim() || row.externalUrl?.trim() || "";
  if (!rawUrl) return null;

  if (isYoutubeUrl(rawUrl)) {
    const videoId = getYoutubeVideoId(rawUrl);
    if (!videoId) return null;
    return {
      provider: "youtube",
      embedUrl: buildSecureYoutubeEmbedUrl(videoId),
      thumbnailUrl: youtubeThumbnailUrl(videoId),
    };
  }

  return { provider: "hosted", streamUrl: rawUrl };
}
