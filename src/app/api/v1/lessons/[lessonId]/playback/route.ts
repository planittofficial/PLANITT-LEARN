import { fail, ok } from "@/lib/api/response";
import { handleDatabaseError } from "@/lib/api/handle-db";
import { decodePathSegment } from "@/lib/api/path";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { requireUser } from "@/lib/security/require-user";
import { getLessonPlayback } from "@/services/courses/lesson-playback.service";
import { getCourseIdForLesson } from "@/services/courses/lesson.service";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";

type RouteContext = { params: Promise<{ lessonId: string }> };

/** Authenticated playback URL — never expose raw YouTube links in course JSON. */
export async function GET(request: Request, context: RouteContext) {
  const limited = enforceApiRateLimit(request, "lessons:playback", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const { lessonId } = await context.params;
  const normalized = decodePathSegment(lessonId);

  try {
    const courseId = await getCourseIdForLesson(normalized);
    if (!courseId) return fail("Lesson not found", 404);

    await assertEnrolled(auth.user.id, courseId, { accessToken: auth.token });

    const playback = await getLessonPlayback(normalized);
    if (!playback) return fail("Video not available", 404);

    return ok({ ok: true, playback });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return handleDatabaseError(error);
  }
}
