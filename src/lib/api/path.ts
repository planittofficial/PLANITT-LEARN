/** Encode a single URL path segment (module id, lesson id, etc.). */
export function encodePathSegment(segment: string): string {
  return encodeURIComponent(segment.trim());
}

/** Decode a route param; falls back to trimmed raw value on malformed encoding. */
export function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment.trim());
  } catch {
    return segment.trim();
  }
}

/** Canonical course id for lookups and enrollment checks. */
export function normalizeCourseId(courseId: string): string {
  return decodePathSegment(courseId).toLowerCase();
}
