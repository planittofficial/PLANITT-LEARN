import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { handleDatabaseError } from "@/lib/api/handle-db";
import { decodePathSegment } from "@/lib/api/path";
import { requireDatabase } from "@/lib/api/require-db";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";
import { submitLessonQuizAttempt } from "@/services/quizzes/lesson-quiz.service";
import { getCourseIdForLesson } from "@/services/courses/lesson.service";
import { computeLeaderboardForCourse } from "@/services/leaderboard/leaderboard.service";
import { requireUser } from "@/lib/security/require-user";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { parseQuizSubmission } from "@/validations/quiz.schema";

type Params = { params: Promise<{ lessonId: string }> };

export async function POST(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "quiz:lesson:submit", 30, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const answers = parseQuizSubmission(body);
  if (!answers) return fail("Invalid quiz submission", 400);

  const { lessonId } = await params;
  const normalized = decodePathSegment(lessonId);

  try {
    const courseId = await getCourseIdForLesson(normalized);
    if (!courseId) return fail("Quiz not available", 404);

    await assertEnrolled(auth.user.id, courseId, { accessToken: auth.token });

    const result = await submitLessonQuizAttempt(auth.user.id, normalized, answers);
    if (!result) return fail("Quiz not available", 404);

    void computeLeaderboardForCourse(courseId).catch(() => undefined);

    return ok({ ok: true, result });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return handleDatabaseError(error);
  }
}
