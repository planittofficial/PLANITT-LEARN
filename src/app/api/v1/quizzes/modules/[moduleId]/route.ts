import { fail, ok } from "@/lib/api/response";
import { handleDatabaseError } from "@/lib/api/handle-db";
import { decodePathSegment } from "@/lib/api/path";
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
  const normalized = decodePathSegment(moduleId);

  try {
    const mod = await prisma.module.findUnique({
      where: { id: normalized },
      select: { courseId: true },
    });
    if (!mod) return ok({ ok: true, test: null });

    await assertEnrolled(auth.user.id, mod.courseId, { accessToken: auth.token });

    const test = await getModuleTestForStudent(normalized);
    return ok({ ok: true, test: test ?? null });
  } catch (error) {
    if (error instanceof EnrollmentError) return fail(error.message, error.status);
    return handleDatabaseError(error);
  }
}
