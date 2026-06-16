import { devLoginResponse, devStandaloneUnavailable } from "@/lib/dev/standalone";
import { devMockUser } from "@/lib/env";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { logServerError } from "@/lib/security/server-log";
import { ensureUserProfile } from "@/services/enrollment/enrollment.service";

/** Dev-only sign-in — no Google OAuth or appbackend required. */
export async function POST(request: Request) {
  const blocked = devStandaloneUnavailable();
  if (blocked) return blocked;

  const limited = enforceApiRateLimit(request, "auth:dev-login", 30, 60_000);
  if (limited) return limited;

  try {
    const user = devMockUser();
    await ensureUserProfile(user);
  } catch (error) {
    logServerError("dev-login user sync", error);
  }

  return devLoginResponse();
}
