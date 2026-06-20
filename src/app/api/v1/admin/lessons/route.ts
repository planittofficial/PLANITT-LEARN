import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import {
  createLesson,
  listLessonsByModule,
  reorderLessons,
} from "@/services/courses/admin-lesson.service";
import { parseCreateLesson } from "@/validations/lesson.schema";

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:lessons:list", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const moduleId = new URL(request.url).searchParams.get("moduleId")?.trim();
  if (!moduleId) return fail("moduleId query parameter is required", 400);

  const lessons = await listLessonsByModule(moduleId);
  return ok({ ok: true, lessons });
}

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:lessons:create", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const input = parseCreateLesson(body);
  if (!input) return fail("Invalid lesson payload", 400);

  try {
    const lesson = await createLesson(input);
    return ok({ ok: true, lesson }, 201);
  } catch {
    return fail("Failed to create lesson — id may already exist", 409);
  }
}

export async function PUT(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:lessons:reorder", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const moduleId = typeof record?.moduleId === "string" ? record.moduleId.trim() : "";
  const orderedIds = Array.isArray(record?.orderedIds)
    ? record.orderedIds.filter((id): id is string => typeof id === "string")
    : [];

  if (!moduleId || orderedIds.length === 0) {
    return fail("moduleId and orderedIds are required", 400);
  }

  const lessons = await reorderLessons(moduleId, orderedIds);
  return ok({ ok: true, lessons });
}
