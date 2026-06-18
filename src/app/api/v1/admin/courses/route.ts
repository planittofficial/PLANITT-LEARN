import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { getDatabaseUrl } from "@/lib/env";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { createCourse, listAdminCourses } from "@/services/courses/course.service";
import { parseCreateCourse } from "@/validations/course.schema";

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:courses:list", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  if (!getDatabaseUrl()) {
    return fail("DATABASE_URL is required for admin course management", 503);
  }

  const courses = await listAdminCourses();
  return ok({ ok: true, courses });
}

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:courses:create", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  if (!getDatabaseUrl()) {
    return fail("DATABASE_URL is required for admin course management", 503);
  }

  const body = await parseJsonBody(request);
  const input = parseCreateCourse(body);
  if (!input) {
    return fail("Invalid course payload — id must start with learn-", 400);
  }

  try {
    const course = await createCourse(input);
    return ok({ ok: true, course }, 201);
  } catch {
    return fail("Failed to create course — id may already exist", 409);
  }
}
