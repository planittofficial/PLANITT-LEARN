import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { handleDatabaseError } from "@/lib/api/handle-db";
import { decodePathSegment } from "@/lib/api/path";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import { getCourseIdForLesson } from "@/services/courses/lesson.service";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";
import {
  getLessonProgress,
  markLessonManuallyComplete,
  ProgressError,
  recordWatchHeartbeat,
} from "@/services/progress/progress.service";
import { parseMarkComplete, parseWatchHeartbeat } from "@/validations/progress.schema";

type RouteContext = { params: Promise<{ lessonId: string }> };

async function resolveLessonCourseId(lessonId: string): Promise<string | null> {
  return getCourseIdForLesson(decodePathSegment(lessonId));
}

export async function GET(request: Request, context: RouteContext) {
  const limited = enforceApiRateLimit(request, "lessons:progress:get", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const { lessonId } = await context.params;
  const normalized = decodePathSegment(lessonId);

  try {
    const courseId = await resolveLessonCourseId(normalized);
    if (!courseId) return fail("Lesson not found", 404);

    await assertEnrolled(auth.user.id, courseId, { accessToken: auth.token });

    const progress = await getLessonProgress(auth.user.id, normalized);
    return ok({ ok: true, progress });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return handleDatabaseError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  const limited = enforceApiRateLimit(request, "lessons:progress:post", 120, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const { lessonId } = await context.params;
  const normalized = decodePathSegment(lessonId);

  try {
    const courseId = await resolveLessonCourseId(normalized);
    if (!courseId) return fail("Lesson not found", 404);

    await assertEnrolled(auth.user.id, courseId, { accessToken: auth.token });

    const body = await parseJsonBody(request);

    if (parseMarkComplete(body)) {
      try {
        const progress = await markLessonManuallyComplete(auth.user.id, normalized);
        return ok({ ok: true, progress });
      } catch (error) {
        if (error instanceof ProgressError) return fail(error.message, error.status);
        return fail("Failed to save progress", 500);
      }
    }

    const payload = parseWatchHeartbeat(body);
    if (!payload) return fail("Invalid progress payload", 400);

    try {
      const result = await recordWatchHeartbeat(
        auth.user.id,
        normalized,
        payload.watchedSeconds,
        payload.durationSeconds,
      );
      return ok({ ok: true, ...result });
    } catch (error) {
      if (error instanceof ProgressError) return fail(error.message, error.status);
      return fail("Failed to save progress", 500);
    }
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return handleDatabaseError(error);
  }
}
