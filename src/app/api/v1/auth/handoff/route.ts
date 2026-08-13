import { NextResponse } from "next/server";

import { learnServiceKey } from "@/lib/env";
import {
  applyAuthCookies,
  stripTokensFromAuthPayload,
} from "@/lib/security/auth-cookies";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/server-log";
import { postHandoffExchange } from "@/services/auth/auth.service";
import { extractAuthTokens, parseAuthJson } from "@/services/auth/session.service";
import { ensureUserProfile } from "@/services/enrollment/enrollment.service";
import { parseHandoffCode } from "@/validations/auth.schema";

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "auth:handoff", 20, 60_000);
  if (limited) return limited;

  if (!learnServiceKey()) {
    return NextResponse.json(
      { ok: false, detail: "SSO handoff is not configured." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);
  const code = parseHandoffCode(body);
  if (!code) {
    return NextResponse.json({ ok: false, detail: "Missing handoff code." }, { status: 400 });
  }

  try {
    const response = await postHandoffExchange(code);
    const text = await response.text();
    const parsed = parseAuthJson(text);

    if (!parsed) {
      return NextResponse.json(
        { ok: false, detail: "Handoff exchange failed." },
        { status: response.status },
      );
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
        logServerError("handoff auth user sync", error);
      });
    }

    const { accessToken, refreshToken } = extractAuthTokens(parsed);
    const safeBody = stripTokensFromAuthPayload(parsed);
    const headers = applyAuthCookies({ accessToken, refreshToken });
    return NextResponse.json(safeBody, { status: response.status, headers });
  } catch (error) {
    logServerError("auth handoff", error);
    return NextResponse.json({ ok: false, detail: "Auth service unavailable." }, { status: 503 });
  }
}
