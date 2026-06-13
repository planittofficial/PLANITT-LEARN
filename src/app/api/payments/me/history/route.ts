import { devPaymentHistoryResponse, isDevAccessToken } from "@/lib/dev/standalone";
import { isDevStandalone } from "@/lib/env";
import { getAccessTokenFromRequest } from "@/lib/security/auth-cookies";
import { proxyAppBackendJson } from "@/lib/security/bff-proxy";
import { NextResponse } from "next/server";

/** Read-only — enrollment source of truth for course access. */
export async function GET(request: Request) {
  if (isDevStandalone()) {
    const token = getAccessTokenFromRequest(request);
    if (!isDevAccessToken(token)) {
      return NextResponse.json({ ok: false, detail: "Unauthorized" }, { status: 401 });
    }
    return devPaymentHistoryResponse();
  }

  return proxyAppBackendJson(request, {
    path: "/api/v1/payments/me/history",
    method: "GET",
    rateBucket: "payments:history",
  });
}
