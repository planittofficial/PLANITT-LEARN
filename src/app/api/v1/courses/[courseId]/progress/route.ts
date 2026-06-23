import { fail, ok } from "@/lib/api/response";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";
import { getCourseProgressForUser } from "@/services/progress/progress.service";
import { getCourseDetail } from "@/services/courses/course.service";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = enforceApiRateLimit(request, "courses:progress", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const { courseId } = await context.params;
  const normalized = courseId.trim().toLowerCase();

  const course = await getCourseDetail(normalized);
  if (!course) return fail("Course not found", 404);

  try {
    await assertEnrolled(auth.user.id, normalized, { accessToken: auth.token });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return fail("Enrollment check failed", 500);
  }

  const progress = await getCourseProgressForUser(auth.user.id, normalized);
  return ok({ ok: true, progress });
}
