import { fail, ok } from "@/lib/api/response";
import { parsePagination, parseSearch } from "@/lib/api/pagination";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { listStudents } from "@/services/users/user.service";

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:students:list", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const pagination = parsePagination(request);
  const search = parseSearch(request);
  const result = await listStudents({ ...pagination, search: search || undefined });

  return ok({ ok: true, ...result });
}
