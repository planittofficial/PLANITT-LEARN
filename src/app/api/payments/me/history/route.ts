import { proxyAppBackendJson } from "@/lib/security/bff-proxy";

/** Read-only — enrollment source of truth for course access. */
export async function GET(request: Request) {
  return proxyAppBackendJson(request, {
    path: "/api/v1/payments/me/history",
    method: "GET",
    rateBucket: "payments:history",
  });
}
