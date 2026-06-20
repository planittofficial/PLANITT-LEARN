import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import {
  deleteLessonQuiz,
  getLessonQuizForAdmin,
  upsertLessonQuiz,
} from "@/services/quizzes/lesson-quiz.service";
import { parseUpsertQuiz } from "@/validations/quiz.schema";

type Params = { params: Promise<{ lessonId: string }> };

export async function GET(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:quiz:lesson:get", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { lessonId } = await params;
  const quiz = await getLessonQuizForAdmin(lessonId.trim());
  return ok({ ok: true, quiz });
}

export async function PUT(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:quiz:lesson:upsert", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const input = parseUpsertQuiz(body);
  if (!input) return fail("Invalid quiz payload", 400);

  const { lessonId } = await params;
  const quiz = await upsertLessonQuiz(lessonId.trim(), input);
  if (!quiz) return fail("Lesson not found", 404);

  return ok({ ok: true, quiz });
}

export async function DELETE(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:quiz:lesson:delete", 20, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { lessonId } = await params;
  const deleted = await deleteLessonQuiz(lessonId.trim());
  if (!deleted) return fail("Quiz not found", 404);

  return ok({ ok: true, deleted: true });
}
