import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import {
  createModule,
  deleteModule,
  getModule,
  listModulesByCourse,
  reorderModules,
  updateModule,
} from "@/services/courses/module.service";
import { parseCreateModule, parseUpdateModule } from "@/validations/admin.schema";

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:modules:list", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const courseId = new URL(request.url).searchParams.get("courseId")?.trim().toLowerCase();
  if (!courseId) return fail("courseId query parameter is required", 400);

  const modules = await listModulesByCourse(courseId);
  return ok({ ok: true, modules });
}

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:modules:create", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const input = parseCreateModule(body);
  if (!input) return fail("Invalid module payload", 400);

  try {
    const moduleRow = await createModule(input);
    return ok({ ok: true, module: moduleRow }, 201);
  } catch {
    return fail("Failed to create module — id may already exist", 409);
  }
}

export async function PUT(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:modules:reorder", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  const courseId = typeof record?.courseId === "string" ? record.courseId.trim() : "";
  const orderedIds = Array.isArray(record?.orderedIds)
    ? record.orderedIds.filter((id): id is string => typeof id === "string")
    : [];

  if (!courseId || orderedIds.length === 0) {
    return fail("courseId and orderedIds are required", 400);
  }

  const modules = await reorderModules(courseId, orderedIds);
  return ok({ ok: true, modules });
}
