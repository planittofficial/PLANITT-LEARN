import type { WatchHeartbeatInput } from "@/types/progress.types";

export function parseMarkComplete(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  return record.markComplete === true || record.completed === true;
}

export function parseWatchHeartbeat(body: unknown): WatchHeartbeatInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const watchedSeconds = Number(record.watchedSeconds ?? record.watched_seconds);
  const durationSeconds = Number(record.durationSeconds ?? record.duration_seconds);

  if (!Number.isFinite(watchedSeconds) || watchedSeconds < 0) return null;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return null;

  return { watchedSeconds, durationSeconds };
}
