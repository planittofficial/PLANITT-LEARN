import { NextResponse } from "next/server";

import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import {
  applyAuthCookies,
  stripTokensFromAuthPayload,
} from "@/lib/security/auth-cookies";
import { logServerError } from "@/lib/security/server-log";
import { postGoogleAuth } from "@/services/auth/auth.service";
import { extractAuthTokens, parseAuthJson } from "@/services/auth/session.service";
import { ensureUserProfile } from "@/services/enrollment/enrollment.service";

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "auth:google", 20, 60_000);
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const response = await postGoogleAuth(body);
    const text = await response.text();
    const parsed = parseAuthJson(text);

    if (!parsed) {
      return NextResponse.json({ ok: false, detail: "Google auth failed." }, { status: response.status });
    }

    const user = parsed.user;
    if (
      response.ok &&
      user &&
      typeof user === "object" &&
      !Array.isArray(user) &&
      typeof (user as Record<string, unknown>).id === "string" &&
      typeof (user as Record<string, unknown>).email === "string"
    ) {
      const profile = user as { id: string; email: string; name?: string | null };
      void ensureUserProfile(profile).catch((error) => {
        logServerError("google auth user sync", error);
      });
    }

    const { accessToken, refreshToken } = extractAuthTokens(parsed);
    const safeBody = stripTokensFromAuthPayload(parsed);
    const headers = applyAuthCookies({ accessToken, refreshToken });
    return NextResponse.json(safeBody, { status: response.status, headers });
  } catch (error) {
    logServerError("auth google", error);
    return NextResponse.json({ ok: false, detail: "Auth service unavailable." }, { status: 503 });
  }
}
