import { fail, ok } from "@/lib/api/response";
import { handleDatabaseError } from "@/lib/api/handle-db";
import { decodePathSegment } from "@/lib/api/path";
import { requireDatabase } from "@/lib/api/require-db";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";
import { getLessonQuizForStudent } from "@/services/quizzes/lesson-quiz.service";
import { getCourseIdForLesson } from "@/services/courses/lesson.service";
import { requireUser } from "@/lib/security/require-user";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";

type Params = { params: Promise<{ lessonId: string }> };

export async function GET(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "quiz:lesson:get", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { lessonId } = await params;
  const normalizedLessonId = decodePathSegment(lessonId);

  try {
    const courseId = await getCourseIdForLesson(normalizedLessonId);

    if (courseId) {
      await assertEnrolled(auth.user.id, courseId, { accessToken: auth.token });
    }

    const quiz = courseId ? await getLessonQuizForStudent(normalizedLessonId) : null;
    return ok({ ok: true, quiz: quiz ?? null });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return handleDatabaseError(error);
  }
}
