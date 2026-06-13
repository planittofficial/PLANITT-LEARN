import { NextResponse } from "next/server";

import { devLoginResponse, devStandaloneUnavailable } from "@/lib/dev/standalone";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";

/** Dev-only sign-in — no Google OAuth or appbackend required. */
export async function POST(request: Request) {
  const blocked = devStandaloneUnavailable();
  if (blocked) return blocked;

  const limited = enforceApiRateLimit(request, "auth:dev-login", 30, 60_000);
  if (limited) return limited;

  return devLoginResponse();
}
