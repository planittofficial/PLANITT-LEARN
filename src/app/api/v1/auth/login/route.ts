import { NextResponse } from "next/server";

import { devLoginResponse, devStandaloneUnavailable } from "@/lib/dev/standalone";
import { devMockUser, isDevStandalone } from "@/lib/env";
import {
  applyAuthCookies,
  stripTokensFromAuthPayload,
} from "@/lib/security/auth-cookies";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/server-log";
import { postCredentialsAuth } from "@/services/auth/auth.service";
import { extractAuthTokens, parseAuthJson } from "@/services/auth/session.service";
import { ensureUserProfile } from "@/services/enrollment/enrollment.service";
import { parseCredentialsLogin } from "@/validations/auth.schema";

function devMockPassword(): string {
  return process.env.LEARN_DEV_MOCK_PASSWORD?.trim() || "learn123";
}

async function handleDevCredentialsLogin(email: string, password: string): Promise<NextResponse> {
  const blocked = devStandaloneUnavailable();
  if (blocked) return blocked;

  const user = devMockUser();
  if (email !== user.email.trim().toLowerCase() || password !== devMockPassword()) {
    return NextResponse.json(
      { ok: false, detail: "Invalid email or password." },
      { status: 401 },
    );
  }

  try {
    await ensureUserProfile(user);
  } catch (error) {
    logServerError("credentials dev-login user sync", error);
  }

  return devLoginResponse();
}

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "auth:login", 20, 60_000);
  if (limited) return limited;

  const body = await request.json().catch(() => null);
  const credentials = parseCredentialsLogin(body);
  if (!credentials) {
    return NextResponse.json({ ok: false, detail: "Enter a valid email and password." }, { status: 400 });
  }

  if (isDevStandalone()) {
    return handleDevCredentialsLogin(credentials.email, credentials.password);
  }

  try {
    const response = await postCredentialsAuth(credentials);
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
      try {
        await ensureUserProfile(profile);
      } catch (error) {
        logServerError("credentials auth user sync", error);
      }
    }

    const { accessToken, refreshToken } = extractAuthTokens(parsed);
    const safeBody = stripTokensFromAuthPayload(parsed);
    const headers = applyAuthCookies({ accessToken, refreshToken });
    return NextResponse.json(safeBody, { status: response.status, headers });
  } catch (error) {
    logServerError("auth login", error);
    return NextResponse.json({ ok: false, detail: "Auth service unavailable." }, { status: 503 });
  }
}
