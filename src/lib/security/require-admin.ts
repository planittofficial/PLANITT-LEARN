import { fail } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { adminEmails, getDatabaseUrl, isDevStandalone, devMockUser } from "@/lib/env";
import { requireUser, type AuthUser } from "@/lib/security/require-user";

export type AdminAuth = { user: AuthUser; token: string };

export async function requireAdmin(
  request: Request,
): Promise<AdminAuth | ReturnType<typeof fail>> {
  const auth = await requireUser(request);
  if (!("user" in auth)) return auth;

  const email = auth.user.email.trim().toLowerCase();
  const allowedEmails = adminEmails();

  if (isDevStandalone() && email === devMockUser().email.trim().toLowerCase()) {
    return auth;
  }

  if (allowedEmails.length > 0 && allowedEmails.includes(email)) {
    return auth;
  }

  if (
    auth.user.role?.trim().toLowerCase() === "admin" ||
    auth.user.isAdmin === true ||
    auth.user.roles?.some((r) => r.trim().toLowerCase() === "admin")
  ) {
    return auth;
  }

  if (getDatabaseUrl()) {
    try {
      const adminUser = await prisma.adminUser.findUnique({
        where: { email },
        select: { id: true },
      });
      if (adminUser) return auth;
    } catch {
      return fail("Admin access check failed", 503);
    }
  }

  if (allowedEmails.length === 0 && !getDatabaseUrl()) {
    return fail("Admin access not configured", 503);
  }

  return fail("Forbidden", 403);
}
