import { fail, ok } from "@/lib/api/response";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { grantSubscriptions } from "@/services/users/user.service";

export async function POST(request: Request) {
  const limited = enforceApiRateLimit(request, "admin:subscriptions:grant", 30, 60_000);
  if (limited) return limited;
  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;
  const dbError = requireDatabase();
  if (dbError) return dbError;

  let body: unknown;
  try { body = await request.json(); } catch { return fail("Invalid JSON body"); }
  if (!body || typeof body !== "object") return fail("Request body is required");
  const input = body as Record<string, unknown>;
  const userIds = Array.isArray(input.userIds) ? [...new Set(input.userIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0).map((id) => id.trim()))] : [];
  const mode = input.mode === "date" ? "date" : input.mode === "days" ? "days" : null;
  if (!userIds.length) return fail("At least one user is required");
  if (!mode) return fail("Mode must be days or date");
  if (mode === "days" && (!Number.isInteger(input.days) || (input.days as number) <= 0)) return fail("Days must be a positive whole number");
  if (mode === "date" && (typeof input.date !== "string" || Number.isNaN(new Date(input.date).getTime()) || new Date(input.date) <= new Date())) return fail("Date must be in the future");
  try {
    const updated = await grantSubscriptions({ userIds, mode, days: input.days as number | undefined, date: input.date as string | undefined });
    return ok({ ok: true, updated });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update subscriptions", 400);
  }
}
