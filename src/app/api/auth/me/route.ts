import { NextResponse } from "next/server";

import { requireAppBackendUrl } from "@/lib/env";
import { getAccessTokenFromRequest } from "@/lib/security/auth-cookies";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/server-log";

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "auth:me", 60, 60_000);
  if (limited) return limited;

  const token = getAccessTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ ok: false, detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${requireAppBackendUrl()}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });
    const text = await response.text();
    try {
      return NextResponse.json(JSON.parse(text), { status: response.status });
    } catch {
      return NextResponse.json({ ok: false, detail: "Auth me failed." }, { status: response.status });
    }
  } catch (error) {
    logServerError("auth me", error);
    return NextResponse.json({ ok: false, detail: "Auth service unavailable." }, { status: 503 });
  }
}
