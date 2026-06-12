import { NextResponse } from "next/server";

import { requireAppBackendUrl } from "@/lib/env";
import {
  applyAuthCookies,
  stripTokensFromAuthPayload,
} from "@/lib/security/auth-cookies";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/server-log";

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "auth:google", 20, 60_000);
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const response = await fetch(`${requireAppBackendUrl()}/api/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(body ?? {}),
    });

    const text = await response.text();
    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const accessToken =
        typeof parsed.access_token === "string" ? parsed.access_token : undefined;
      const refreshToken =
        typeof parsed.refresh_token === "string" ? parsed.refresh_token : undefined;
      const safeBody = stripTokensFromAuthPayload(parsed);
      const headers = applyAuthCookies({ accessToken, refreshToken });
      return NextResponse.json(safeBody, { status: response.status, headers });
    } catch {
      return NextResponse.json({ ok: false, detail: "Google auth failed." }, { status: response.status });
    }
  } catch (error) {
    logServerError("auth google", error);
    return NextResponse.json({ ok: false, detail: "Auth service unavailable." }, { status: 503 });
  }
}
