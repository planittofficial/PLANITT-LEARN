import { fail, ok } from "@/lib/api/response";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { getPlatformOverview } from "@/services/analytics/overview.service";

export async function GET(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:overview", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const overview = await getPlatformOverview();
  return ok({ ok: true, overview });
}
