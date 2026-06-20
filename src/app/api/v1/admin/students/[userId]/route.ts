import { fail, ok } from "@/lib/api/response";
import { requireDatabase } from "@/lib/api/require-db";
import { requireAdmin } from "@/lib/security/require-admin";
import { enforceApiRateLimit } from "@/lib/security/rate-limit";
import { getStudentDetail } from "@/services/users/user.service";

type Params = { params: Promise<{ userId: string }> };

export async function GET(request: Request, { params }: Params) {
  const limited = enforceApiRateLimit(request, "admin:students:get", 60, 60_000);
  if (limited) return limited;

  const admin = await requireAdmin(request);
  if (!("user" in admin)) return admin;

  const dbError = requireDatabase();
  if (dbError) return dbError;

  const { userId } = await params;
  const student = await getStudentDetail(userId.trim());
  if (!student) return fail("Student not found", 404);

  return ok({ ok: true, student });
}
