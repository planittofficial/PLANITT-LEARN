/** Learn-app cookie names — isolated from apps/website to avoid session collisions. */

export const ACCESS_TOKEN_COOKIE = "alvest_learn_access_token";
export const REFRESH_TOKEN_COOKIE = "alvest_learn_refresh_token";
export const SESSION_HINT_COOKIE = "alvest_learn_session_hint";

const ACCESS_MAX_AGE = 30 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;
const HINT_MAX_AGE = 24 * 60 * 60;

function cookieFlags(maxAge: number, httpOnly: boolean): string {
  const secure = process.env.NODE_ENV === "production";
  return [
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
    httpOnly ? "HttpOnly" : "",
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function accessTokenCookieHeader(token: string): string {
  return `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; ${cookieFlags(ACCESS_MAX_AGE, true)}`;
}

export function refreshTokenCookieHeader(token: string): string {
  return `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}; ${cookieFlags(REFRESH_MAX_AGE, true)}`;
}

export function sessionHintCookieHeader(): string {
  return `${SESSION_HINT_COOKIE}=1; ${cookieFlags(HINT_MAX_AGE, false)}`;
}

export function clearAuthCookieHeaders(): string[] {
  const expire = "Path=/; Max-Age=0; SameSite=Lax";
  return [
    `${ACCESS_TOKEN_COOKIE}=; ${expire}`,
    `${REFRESH_TOKEN_COOKIE}=; ${expire}`,
    `${SESSION_HINT_COOKIE}=; ${expire}`,
  ];
}

export function getAccessTokenFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ACCESS_TOKEN_COOKIE) {
      const value = rest.join("=").trim();
      if (!value) continue;
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
}

export function getRefreshTokenFromRequest(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === REFRESH_TOKEN_COOKIE) {
      const value = rest.join("=").trim();
      if (!value) continue;
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
}

export function stripTokensFromAuthPayload(body: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...body };
  delete next.access_token;
  delete next.accessToken;
  delete next.refresh_token;
  delete next.refreshToken;

  for (const key of ["tokens", "data"] as const) {
    const value = next[key];
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;

    const nested = { ...(value as Record<string, unknown>) };
    delete nested.access_token;
    delete nested.accessToken;
    delete nested.refresh_token;
    delete nested.refreshToken;
    next[key] = nested;
  }

  return next;
}

export function applyAuthCookies(
  tokens: { accessToken?: string; refreshToken?: string },
): Headers {
  const headers = new Headers();
  const setCookies: string[] = [];

  if (tokens.accessToken) setCookies.push(accessTokenCookieHeader(tokens.accessToken));
  if (tokens.refreshToken) setCookies.push(refreshTokenCookieHeader(tokens.refreshToken));
  if (tokens.accessToken) setCookies.push(sessionHintCookieHeader());

  for (const cookie of setCookies) {
    headers.append("Set-Cookie", cookie);
  }
  return headers;
}
