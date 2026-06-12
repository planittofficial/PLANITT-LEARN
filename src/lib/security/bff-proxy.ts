import { requireAppBackendUrl } from "@/lib/env";
import { getAccessTokenFromRequest } from "@/lib/security/auth-cookies";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/server-log";
import { NextResponse } from "next/server";

type ProxyOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  rateBucket: string;
  requireAuth?: boolean;
};

/** Read-only BFF proxy — GET only for interns in v1 (payments history). */
export async function proxyAppBackendJson(
  request: Request,
  { path, method, rateBucket, requireAuth = true }: ProxyOptions,
): Promise<NextResponse> {
  const limited = enforceApiRateLimit(request, rateBucket, 60, 60_000);
  if (limited) return limited;

  const verb = method ?? request.method;
  if (verb !== "GET" && verb !== "HEAD") {
    return NextResponse.json({ ok: false, detail: "Method not allowed in learn BFF v1." }, { status: 405 });
  }

  const token = getAccessTokenFromRequest(request);
  if (requireAuth && !token) {
    return NextResponse.json({ ok: false, detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${requireAppBackendUrl()}${path}`, {
      method: verb,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    const text = await response.text();
    try {
      return NextResponse.json(JSON.parse(text), { status: response.status });
    } catch {
      return NextResponse.json(
        { ok: false, detail: "Upstream returned invalid JSON." },
        { status: response.status },
      );
    }
  } catch (error) {
    logServerError(`proxy ${path}`, error);
    return NextResponse.json({ ok: false, detail: "Service unavailable" }, { status: 503 });
  }
}
