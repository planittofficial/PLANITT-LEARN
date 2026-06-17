import { NextResponse } from "next/server";

import { devRefreshResponse, isDevRefreshToken } from "@/lib/dev/standalone";
import {
  applyAuthCookies,
  clearAuthCookieHeaders,
  getRefreshTokenFromRequest,
  stripTokensFromAuthPayload,
} from "@/lib/security/auth-cookies";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { postRefreshSession } from "@/services/auth/auth.service";
import { extractAuthTokens, parseAuthJson } from "@/services/auth/session.service";

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "auth:refresh", 30, 60_000);
  if (limited) return limited;

  const refreshToken = getRefreshTokenFromRequest(request);
  if (!refreshToken) {
    return NextResponse.json({ ok: false, detail: "Missing refresh token." }, { status: 401 });
  }

  if (isDevRefreshToken(refreshToken)) {
    return devRefreshResponse();
  }

  const response = await postRefreshSession(refreshToken);
  const text = await response.text();
  const parsed = parseAuthJson(text);

  if (!parsed) {
    return NextResponse.json({ ok: false, detail: "Refresh failed." }, { status: response.status });
  }

  const { accessToken, refreshToken: nextRefresh } = extractAuthTokens(parsed);
  const headers = applyAuthCookies({
    accessToken,
    refreshToken: nextRefresh ?? refreshToken,
  });
  return NextResponse.json(stripTokensFromAuthPayload(parsed), {
    status: response.status,
    headers,
  });
}

export async function DELETE() {
  const headers = new Headers();
  for (const cookie of clearAuthCookieHeaders()) {
    headers.append("Set-Cookie", cookie);
  }
  return NextResponse.json({ ok: true }, { headers });
}
