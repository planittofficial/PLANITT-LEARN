import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import {
  deleteModuleTest,
  getModuleTestForAdmin,
  upsertModuleTest,
} from "@/services/quizzes/module-test.service";
import { parseUpsertQuiz } from "@/validations/quiz.schema";

type Params = { params: Promise<{ moduleId: string }> };

export async function GET(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:quiz:module:get", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { moduleId } = await params;
  const test = await getModuleTestForAdmin(moduleId.trim());
  return ok({ ok: true, test });
}

export async function PUT(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:quiz:module:upsert", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const input = parseUpsertQuiz(body);
  if (!input) return fail("Invalid module test payload", 400);

  const { moduleId } = await params;
  const test = await upsertModuleTest(moduleId.trim(), input);
  if (!test) return fail("Module not found", 404);

  return ok({ ok: true, test });
}

export async function DELETE(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:quiz:module:delete", 20, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { moduleId } = await params;
  const deleted = await deleteModuleTest(moduleId.trim());
  if (!deleted) return fail("Module test not found", 404);

  return ok({ ok: true, deleted: true });
}
