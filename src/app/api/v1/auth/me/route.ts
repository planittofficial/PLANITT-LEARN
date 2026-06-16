import { NextResponse } from "next/server";

import { devAuthMeResponse, isDevAccessToken } from "@/lib/dev/standalone";
import { getAccessTokenFromRequest } from "@/lib/security/auth-cookies";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/server-log";
import { fetchAuthMe } from "@/services/auth/auth.service";

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "auth:me", 60, 60_000);
  if (limited) return limited;

  const token = getAccessTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ ok: false, detail: "Unauthorized" }, { status: 401 });
  }

  if (isDevAccessToken(token)) {
    return devAuthMeResponse();
  }

  try {
    const result = await fetchAuthMe(token);
    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          detail: result.status === 503 ? "Auth service unavailable." : "Unauthorized",
        },
        { status: result.status },
      );
    }

    return NextResponse.json({ ok: true, user: result.user });
  } catch (error) {
    logServerError("auth me", error);
    return NextResponse.json({ ok: false, detail: "Auth service unavailable." }, { status: 503 });
  }
}
