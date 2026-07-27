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

function readToken(source: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!source) return undefined;

  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

export function extractAuthTokens(parsed: Record<string, unknown>): {
  accessToken?: string;
  refreshToken?: string;
} {
  const nestedTokens =
    parsed.tokens && typeof parsed.tokens === "object" && !Array.isArray(parsed.tokens)
      ? (parsed.tokens as Record<string, unknown>)
      : undefined;
  const nestedData =
    parsed.data && typeof parsed.data === "object" && !Array.isArray(parsed.data)
      ? (parsed.data as Record<string, unknown>)
      : undefined;

  const accessToken =
    readToken(parsed, ["access_token", "accessToken"]) ??
    readToken(nestedTokens, ["access_token", "accessToken"]) ??
    readToken(nestedData, ["access_token", "accessToken"]);
  const refreshToken =
    readToken(parsed, ["refresh_token", "refreshToken"]) ??
    readToken(nestedTokens, ["refresh_token", "refreshToken"]) ??
    readToken(nestedData, ["refresh_token", "refreshToken"]);
  return { accessToken, refreshToken };
}
