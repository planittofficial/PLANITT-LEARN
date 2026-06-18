import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import { getCourseIdForLesson } from "@/services/courses/lesson.service";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";
import {
  getLessonProgress,
  ProgressError,
  recordWatchHeartbeat,
} from "@/services/progress/progress.service";
import { parseWatchHeartbeat } from "@/validations/progress.schema";

type RouteContext = { params: Promise<{ lessonId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const limited = enforceApiRateLimit(request, "lessons:progress:get", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const { lessonId } = await context.params;
  const courseId = await getCourseIdForLesson(lessonId);
  if (!courseId) return fail("Lesson not found", 404);

  try {
    await assertEnrolled(auth.user.id, courseId, { accessToken: auth.token });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return fail("Enrollment check failed", 500);
  }

  const progress = await getLessonProgress(auth.user.id, lessonId);
  return ok({ ok: true, progress });
}

export async function POST(request: Request, context: RouteContext) {
  const limited = enforceApiRateLimit(request, "lessons:progress:post", 120, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const { lessonId } = await context.params;
  const courseId = await getCourseIdForLesson(lessonId);
  if (!courseId) return fail("Lesson not found", 404);

  try {
    await assertEnrolled(auth.user.id, courseId, { accessToken: auth.token });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return fail("Enrollment check failed", 500);
  }

  const body = await parseJsonBody(request);
  const payload = parseWatchHeartbeat(body);
  if (!payload) return fail("Invalid progress payload", 400);

  try {
    const result = await recordWatchHeartbeat(
      auth.user.id,
      lessonId,
      payload.watchedSeconds,
      payload.durationSeconds,
    );
    return ok({ ok: true, ...result });
  } catch (error) {
    if (error instanceof ProgressError) return fail(error.message, error.status);
    return fail("Failed to save progress", 500);
  }
}
