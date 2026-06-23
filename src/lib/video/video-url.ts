function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function isYoutubeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  const parsed = parseUrl(trimmed);
  if (!parsed) {
    return trimmed.includes("youtube.com") || trimmed.includes("youtu.be");
  }
  const host = parsed.hostname.replace(/^www\./, "");
  return host === "youtube.com" || host === "youtu.be";
}

/** Normalizes watch, share, shorts, and embed URLs to a YouTube embed URL. */
export function toYoutubeEmbedUrl(url: string): string | null {
  if (!isYoutubeUrl(url)) return null;

  const parsed = parseUrl(url.trim());
  if (!parsed) return null;

  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = parsed.pathname.replace(/^\//, "").split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (parsed.pathname.startsWith("/embed/")) {
    const id = parsed.pathname.split("/")[2];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (parsed.pathname.startsWith("/shorts/")) {
    const id = parsed.pathname.split("/")[2];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  const id = parsed.searchParams.get("v");
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
