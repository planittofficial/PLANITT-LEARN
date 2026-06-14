import { fail } from "@/lib/api/response";

/** Admin guard — Gauri wires to admin_users table in Phase 2. */
export async function requireAdmin(_request: Request) {
  return fail("Admin access not configured", 501);
}
