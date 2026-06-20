import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import {
  deleteCourse,
  getAdminCourse,
  updateCourse,
} from "@/services/courses/course.service";
import { parseUpdateCourse } from "@/validations/course.schema";

type Params = { params: Promise<{ courseId: string }> };

export async function GET(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:courses:get", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { courseId } = await params;
  const course = await getAdminCourse(courseId.trim().toLowerCase());
  if (!course) return fail("Course not found", 404);

  return ok({ ok: true, course });
}

export async function PATCH(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:courses:update", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const input = parseUpdateCourse(body);
  if (!input) return fail("Invalid course update payload", 400);

  const { courseId } = await params;
  const course = await updateCourse(courseId.trim().toLowerCase(), input);
  if (!course) return fail("Course not found", 404);

  return ok({ ok: true, course });
}

export async function DELETE(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:courses:delete", 20, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { courseId } = await params;
  const deleted = await deleteCourse(courseId.trim().toLowerCase());
  if (!deleted) return fail("Course not found", 404);

  return ok({ ok: true, deleted: true });
}
