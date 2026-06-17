import { ok } from "@/lib/api/response";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import { isEnrolled } from "@/services/enrollment/enrollment.service";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = enforceApiRateLimit(request, "enrollment:verify", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const { courseId } = await context.params;
  const normalizedCourseId = courseId.trim().toLowerCase();
  if (!normalizedCourseId) {
    return ok({ ok: true, enrolled: false });
  }

  const enrolled = await isEnrolled(auth.user.id, normalizedCourseId, {
    accessToken: auth.token,
  });

  return ok({ ok: true, enrolled });
}
