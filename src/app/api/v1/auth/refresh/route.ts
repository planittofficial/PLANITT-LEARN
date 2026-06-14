import { NextResponse } from "next/server";

import { devRefreshResponse, isDevRefreshToken } from "@/lib/dev/standalone";
import { requireAppBackendUrl } from "@/lib/env";
import {
  applyAuthCookies,
  clearAuthCookieHeaders,
  getRefreshTokenFromRequest,
  stripTokensFromAuthPayload,
} from "@/lib/security/auth-cookies";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";

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

  const response = await fetch(`${requireAppBackendUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const accessToken =
      typeof parsed.access_token === "string" ? parsed.access_token : undefined;
    const nextRefresh =
      typeof parsed.refresh_token === "string" ? parsed.refresh_token : refreshToken;
    const headers = applyAuthCookies({ accessToken, refreshToken: nextRefresh });
    return NextResponse.json(stripTokensFromAuthPayload(parsed), { status: response.status, headers });
  } catch {
    return NextResponse.json({ ok: false, detail: "Refresh failed." }, { status: response.status });
  }
}

export async function DELETE() {
  const headers = new Headers();
  for (const cookie of clearAuthCookieHeaders()) {
    headers.append("Set-Cookie", cookie);
  }
  return NextResponse.json({ ok: true }, { headers });
}
