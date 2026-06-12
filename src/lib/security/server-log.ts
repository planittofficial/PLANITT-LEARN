const isDev = process.env.NODE_ENV !== "production";

export function logServerError(context: string, error: unknown): void {
  if (!isDev) return;
  console.error(`[learn:${context}]`, error);
}
