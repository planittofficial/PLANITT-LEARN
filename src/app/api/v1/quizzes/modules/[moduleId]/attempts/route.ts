import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { decodePathSegment } from "@/lib/api/path";
import { requireDatabase } from "@/lib/api/require-db";
import { prisma } from "@/lib/db/prisma";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";
import { submitModuleTestAttempt } from "@/services/quizzes/module-test.service";
import { computeLeaderboardForCourse } from "@/services/leaderboard/leaderboard.service";
import { requireUser } from "@/lib/security/require-user";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { parseQuizSubmission } from "@/validations/quiz.schema";

type Params = { params: Promise<{ moduleId: string }> };

export async function POST(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "quiz:module:submit", 30, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const answers = parseQuizSubmission(body);
  if (!answers) return fail("Invalid test submission", 400);

  const { moduleId } = await params;
  const normalized = decodePathSegment(moduleId);

  const mod = await prisma.module.findUnique({
    where: { id: normalized },
    select: { courseId: true },
  });
  if (!mod) return fail("Module not found", 404);

  try {
    await assertEnrolled(auth.user.id, mod.courseId, { accessToken: auth.token });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return fail("Enrollment check failed", 500);
  }

  const result = await submitModuleTestAttempt(auth.user.id, normalized, answers);
  if (!result) return fail("Module test not available", 404);

  void computeLeaderboardForCourse(mod.courseId).catch(() => undefined);

  return ok({ ok: true, result });
}
