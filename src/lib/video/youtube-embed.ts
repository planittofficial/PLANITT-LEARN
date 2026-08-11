import { isYoutubeUrl } from "@/lib/video/video-url";

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

/** Extract a YouTube video id without exposing a share/watch URL. */
export function getYoutubeVideoId(url: string): string | null {
  if (!isYoutubeUrl(url)) return null;

  const parsed = parseUrl(url.trim());
  if (!parsed) return null;

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    return parsed.pathname.replace(/^\//, "").split("/")[0] || null;
  }

  if (parsed.pathname.startsWith("/embed/")) {
    return parsed.pathname.split("/")[2] || null;
  }

  if (parsed.pathname.startsWith("/shorts/")) {
    return parsed.pathname.split("/")[2] || null;
  }

  return parsed.searchParams.get("v");
}

/**
 * Privacy-enhanced embed with reduced branding and related videos.
 * Still not DRM — use self-hosted R2 video for paid course content.
 */
export function buildSecureYoutubeEmbedUrl(videoId: string, origin?: string): string {
  const params = new URLSearchParams({
    modestbranding: "1",
    rel: "0",
    iv_load_policy: "3",
    playsinline: "1",
    controls: "1",
    enablejsapi: "1",
  });

  if (origin) params.set("origin", origin);

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}
