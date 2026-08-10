import { fail, ok } from "@/lib/api/response";
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
  const courseId = await getCourseIdForLesson(lessonId.trim());
  if (!courseId) return fail("Lesson not found", 404);

  try {
    await assertEnrolled(auth.user.id, courseId, { accessToken: auth.token });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return fail("Enrollment check failed", 500);
  }

  const quiz = await getLessonQuizForStudent(lessonId.trim());
  return ok({ ok: true, quiz: quiz ?? null });
}
