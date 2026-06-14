import { fail } from "@/lib/api/response";
import { isDevAccessToken, devAuthMeResponse } from "@/lib/dev/standalone";
import { getAccessTokenFromRequest } from "@/lib/security/auth-cookies";
import { requireAppBackendUrl } from "@/lib/env";

export type AuthUser = { id: string; email: string; name: string };

export async function requireUser(request: Request): Promise<
  | { user: AuthUser; token: string }
  | ReturnType<typeof fail>
> {
  const token = getAccessTokenFromRequest(request);
  if (!token) return fail("Unauthorized", 401);

  if (isDevAccessToken(token)) {
    const res = devAuthMeResponse();
    const data = (await res.json()) as { user?: AuthUser };
    if (!data.user?.id) return fail("Unauthorized", 401);
    return { user: data.user, token };
  }

  try {
    const response = await fetch(`${requireAppBackendUrl()}/api/v1/auth/me`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!response.ok) return fail("Unauthorized", 401);
    const data = (await response.json()) as { user?: AuthUser };
    if (!data.user?.id) return fail("Unauthorized", 401);
    return { user: data.user, token };
  } catch {
    return fail("Auth service unavailable", 503);
  }
}
