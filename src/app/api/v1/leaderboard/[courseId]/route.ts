import { fail, ok } from "@/lib/api/response";
import { requireDatabase } from "@/lib/api/require-db";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";
import { getLeaderboard } from "@/services/leaderboard/leaderboard.service";
import { requireUser } from "@/lib/security/require-user";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { isDevStandalone } from "@/lib/env";
import { buildStandaloneLeaderboard } from "@/lib/learning/standalone-leaderboard";

type Params = { params: Promise<{ courseId: string }> };

export async function GET(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "leaderboard:get", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const { courseId } = await params;
  const normalized = courseId.trim().toLowerCase();

  if (isDevStandalone()) {
    const rows = buildStandaloneLeaderboard(normalized, {
      id: auth.user.id,
      name: auth.user.name || "You",
    });
    return ok({ ok: true, leaderboard: rows });
  }

  const dbError = requireDatabase();
  if (dbError) return dbError;

  try {
    await assertEnrolled(auth.user.id, normalized, { accessToken: auth.token });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return fail("Enrollment check failed", 500);
  }

  const rows = await getLeaderboard(normalized);
  return ok({ ok: true, leaderboard: rows });
}
