import { fail, ok } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse-body";
import { decodePathSegment } from "@/lib/api/path";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { deleteModule, getModule, updateModule } from "@/services/courses/module.service";
import { parseUpdateModule } from "@/validations/admin.schema";

type Params = { params: Promise<{ moduleId: string }> };

export async function GET(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:modules:get", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { moduleId } = await params;
  const normalized = decodePathSegment(moduleId);
  const moduleRow = await getModule(normalized);
  if (!moduleRow) return fail("Module not found", 404);

  return ok({ ok: true, module: moduleRow });
}

export async function PATCH(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:modules:update", 30, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const body = await parseJsonBody(request);
  const input = parseUpdateModule(body);
  if (!input) return fail("Invalid module update payload", 400);

  const { moduleId } = await params;
  const normalized = decodePathSegment(moduleId);
  const moduleRow = await updateModule(normalized, input);
  if (!moduleRow) return fail("Module not found", 404);

  return ok({ ok: true, module: moduleRow });
}

export async function DELETE(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:modules:delete", 20, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { moduleId } = await params;
  const deleted = await deleteModule(decodePathSegment(moduleId));
  if (!deleted) return fail("Module not found", 404);

  return ok({ ok: true, deleted: true });
}
