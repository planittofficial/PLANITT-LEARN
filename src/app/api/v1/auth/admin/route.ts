import { ok } from "@/lib/api/response";
import { requireAdmin } from "@/lib/security/require-admin";

/** Returns whether the current session has admin access. */
export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!("user" in admin)) {
    return ok({ ok: true, isAdmin: false });
  }
  return ok({ ok: true, isAdmin: true, user: admin.user });
}
