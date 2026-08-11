import { fail, ok } from "@/lib/api/response";
import { handleDatabaseError } from "@/lib/api/handle-db";
import { decodePathSegment } from "@/lib/api/path";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import { getLessonContext } from "@/services/courses/lesson.service";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";

type RouteContext = { params: Promise<{ lessonId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = enforceApiRateLimit(request, "lessons:detail", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const { lessonId } = await context.params;
  const normalized = decodePathSegment(lessonId);

  try {
    const ctx = await getLessonContext(normalized);
    if (!ctx) return fail("Lesson not found", 404);

    await assertEnrolled(auth.user.id, ctx.courseId, { accessToken: auth.token });

    return ok({
      ok: true,
      lesson: ctx.lesson,
      moduleId: ctx.moduleId,
      courseId: ctx.courseId,
    });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return handleDatabaseError(error);
  }
}
