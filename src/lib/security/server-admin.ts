import { cookies } from "next/headers";

import { adminEmails, devMockUser, getDatabaseUrl, isDevStandalone } from "@/lib/env";
import { isDevAccessToken } from "@/lib/dev/standalone";
import { prisma } from "@/lib/db/prisma";
import { ACCESS_TOKEN_COOKIE } from "@/lib/security/auth-cookies";
import { fetchAuthMe } from "@/services/auth/auth.service";

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function isAdminEmail(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const allowed = adminEmails();
  if (allowed.length > 0 && allowed.includes(normalized)) return true;

  if (getDatabaseUrl()) {
    try {
      const adminUser = await prisma.adminUser.findUnique({
        where: { email: normalized },
        select: { id: true },
      });
      if (adminUser) return true;
    } catch {
      // DB unavailable — fall through
    }
  }

  return false;
}

/** Server-side admin check for layouts (reads session cookie). */
export async function isServerAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!raw) return false;

  const token = decodeCookieValue(raw);

  if (isDevStandalone() && isDevAccessToken(token)) {
    return isAdminEmail(devMockUser().email);
  }

  const result = await fetchAuthMe(token);
  if (!result.ok) return false;

  const user = result.user;
  if (
    user.role?.trim().toLowerCase() === "admin" ||
    user.isAdmin === true ||
    user.roles?.some((role) => role.trim().toLowerCase() === "admin")
  ) {
    return true;
  }

  return isAdminEmail(user.email);
}
