/**
 * Server-side environment for the Learn portal only.
 * Do not import from apps/website — keep this app isolated.
 */

function trimUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, "") : undefined;
}

const isProduction = process.env.NODE_ENV === "production";

export const APPBACKEND_URL =
  trimUrl(process.env.APPBACKEND_URL) ?? (isProduction ? "" : "http://127.0.0.1:8000");

export const MAIN_WEBSITE_URL = trimUrl(process.env.NEXT_PUBLIC_MAIN_WEBSITE_URL) ?? "http://localhost:3000";

export function requireAppBackendUrl(): string {
  if (!APPBACKEND_URL) {
    throw new Error("Missing APPBACKEND_URL.");
  }
  return APPBACKEND_URL;
}

/** Dev-only mock enrollments (comma-separated plan IDs). Never enable in production. */
export function devMockEnrollments(): string[] {
  if (isProduction) return [];
  const raw = process.env.LEARN_DEV_MOCK_ENROLLMENTS?.trim();
  if (!raw) return [];
  return raw.split(",").map((id) => id.trim().toLowerCase()).filter(Boolean);
}

function envFlag(value: string | undefined): boolean {
  const v = value?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/**
 * Local dev without Planitt appbackend.
 * Enable with LEARN_DEV_STANDALONE=true — used by the whole team locally.
 * Blocked automatically in production.
 */
export function isDevStandalone(): boolean {
  if (isProduction) return false;
  return envFlag(process.env.LEARN_DEV_STANDALONE);
}

/** Mock user profile for dev standalone login (server-side). */
export function devMockUser(): { id: string; email: string; name: string } {
  return {
    id: process.env.LEARN_DEV_MOCK_USER_ID?.trim() || "dev-local-001",
    email: process.env.LEARN_DEV_MOCK_USER_EMAIL?.trim() || "intern@localhost.dev",
    name: process.env.LEARN_DEV_MOCK_USER_NAME?.trim() || "Local Dev User",
  };
}

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL?.trim() || undefined;
}

export function requireDatabaseUrl(): string {
  const url = getDatabaseUrl();
  if (!url) {
    throw new Error("Missing DATABASE_URL.");
  }
  return url;
}
