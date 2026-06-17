export function parseAuthJson(text: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractAuthTokens(parsed: Record<string, unknown>): {
  accessToken?: string;
  refreshToken?: string;
} {
  const accessToken =
    typeof parsed.access_token === "string" ? parsed.access_token : undefined;
  const refreshToken =
    typeof parsed.refresh_token === "string" ? parsed.refresh_token : undefined;
  return { accessToken, refreshToken };
}
