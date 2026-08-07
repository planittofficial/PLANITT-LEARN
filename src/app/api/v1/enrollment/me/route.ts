import { ok } from "@/lib/api/response";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import {
  ensureUserProfile,
  getEnrollmentSnapshot,
} from "@/services/enrollment/enrollment.service";

/**
 * Canonical enrollment endpoint for the student UI and main-website integration.
 *
 * Production flow (LEARN_DEV_STANDALONE=false):
 *   1. User signs in with same Google client ID → appbackend issues tokens (BFF cookies)
 *   2. This route reads payment history from appbackend
 *   3. Filters paid transactions where plan_id starts with "learn-"
 *   4. Returns enrolledCourseIds — UI shows only those courses
 *
 * Also merges Learn DB enrollments (webhook sync) when DATABASE_URL is set.
 */
export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "enrollment:me", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  try {
    await ensureUserProfile(auth.user);
  } catch {
    // Non-fatal — enrollment still works from payment history
  }

  const snapshot = await getEnrollmentSnapshot(auth.user.id, auth.token);

  return ok({
    ok: true,
    enrolledCourseIds: snapshot.enrolledCourseIds,
    items: snapshot.transactions,
    source: snapshot.source,
    paymentHistoryError: snapshot.paymentHistoryError,
  });
}
