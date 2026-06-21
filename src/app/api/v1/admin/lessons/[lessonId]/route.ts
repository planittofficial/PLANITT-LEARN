import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import {
  deleteLesson,
  getAdminLesson,
  updateLesson,
} from "@/services/courses/admin-lesson.service";
import { parseUpdateLesson } from "@/validations/lesson.schema";

type Params = { params: Promise<{ lessonId: string }> };

export async function GET(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:lessons:get", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { lessonId } = await params;
  const lesson = await getAdminLesson(lessonId.trim());
  if (!lesson) return fail("Lesson not found", 404);

  return ok({ ok: true, lesson });
}

export async function PATCH(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:lessons:update", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const input = parseUpdateLesson(body);
  if (!input) return fail("Invalid lesson update payload", 400);

  const { lessonId } = await params;
  const lesson = await updateLesson(lessonId.trim(), input);
  if (!lesson) return fail("Lesson not found", 404);

  return ok({ ok: true, lesson });
}

export async function DELETE(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:lessons:delete", 20, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { lessonId } = await params;
  const deleted = await deleteLesson(lessonId.trim());
  if (!deleted) return fail("Lesson not found", 404);

  return ok({ ok: true, deleted: true });
}
