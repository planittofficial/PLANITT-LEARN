import { NextResponse } from "next/server";

import { devLoginResponse, devStandaloneUnavailable } from "@/lib/dev/standalone";
import { devMockUser, isDevStandalone } from "@/lib/env";
import {
  applyAuthCookies,
  stripTokensFromAuthPayload,
} from "@/lib/security/auth-cookies";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/server-log";
import { postMpinAuth } from "@/services/auth/auth.service";
import { extractAuthTokens, parseAuthJson } from "@/services/auth/session.service";
import { ensureUserProfile } from "@/services/enrollment/enrollment.service";
import { parseMpinLogin } from "@/validations/auth.schema";

function devMockMpin(): string {
  return process.env.LEARN_DEV_MOCK_MPIN?.trim() || "123456";
}

async function handleDevMpinLogin(email: string, mpin: string): Promise<NextResponse> {
  const blocked = devStandaloneUnavailable();
  if (blocked) return blocked;

  const user = devMockUser();
  if (email !== user.email.trim().toLowerCase() || mpin !== devMockMpin()) {
    return NextResponse.json({ ok: false, detail: "Invalid email or MPIN." }, { status: 401 });
  }

  // Never block sign-in on DB sync (pooler hangs would leave the UI on "Signing in…")
  void ensureUserProfile(user).catch((error) => {
    logServerError("mpin dev-login user sync", error);
  });

  return devLoginResponse();
}

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "auth:login-mpin", 20, 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const credentials = parseMpinLogin(body);
  if (!credentials) {
    return NextResponse.json(
      { ok: false, detail: "Enter a valid email and 6-digit MPIN." },
      { status: 400 },
    );
  }

  if (isDevStandalone()) {
    return handleDevMpinLogin(credentials.email, credentials.mpin);
  }

  try {
    const response = await postMpinAuth(credentials);
    const text = await response.text();
    const parsed = parseAuthJson(text);

    if (!parsed) {
      return NextResponse.json(
        { ok: false, detail: "Sign-in failed." },
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
        logServerError("mpin auth user sync", error);
      });
    }

    const { accessToken, refreshToken } = extractAuthTokens(parsed);
    const safeBody = stripTokensFromAuthPayload(parsed);
    const headers = applyAuthCookies({ accessToken, refreshToken });
    return NextResponse.json(safeBody, { status: response.status, headers });
  } catch (error) {
    logServerError("auth login mpin", error);
    return NextResponse.json({ ok: false, detail: "Auth service unavailable." }, { status: 503 });
  }
}
