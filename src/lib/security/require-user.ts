import { fail } from "@/lib/api/response";
import { isDevAccessToken, devAuthMeResponse } from "@/lib/dev/standalone";
import { getAccessTokenFromRequest } from "@/lib/security/auth-cookies";
import { fetchAuthMe } from "@/services/auth/auth.service";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
  isAdmin?: boolean;
};

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

  const result = await fetchAuthMe(token);
  if (!result.ok) {
    return fail(result.status === 503 ? "Auth service unavailable" : "Unauthorized", result.status);
  }

  return { user: result.user, token };
}
