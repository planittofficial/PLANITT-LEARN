import { fail, ok } from "@/lib/api/response";
import { requireDatabase } from "@/lib/api/require-db";
import { prisma } from "@/lib/db/prisma";
import {
  assertEnrolled,
  EnrollmentError,
} from "@/services/enrollment/enrollment.service";
import { getModuleTestForStudent } from "@/services/quizzes/module-test.service";
import { requireUser } from "@/lib/security/require-user";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";

type Params = { params: Promise<{ moduleId: string }> };

export async function GET(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "quiz:module:get", 60, 60_000);
  if (limited) return limited;

  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { moduleId } = await params;
  const normalized = moduleId.trim();

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

  const test = await getModuleTestForStudent(normalized);
  if (!test) return fail("Module test not available", 404);

  return ok({ ok: true, test });
}
