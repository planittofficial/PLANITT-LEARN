import { requireAppBackendUrl } from "@/lib/env";
import type { AuthUser } from "@/lib/security/require-user";

export async function postGoogleAuth(body: unknown): Promise<Response> {
  return fetch(`${requireAppBackendUrl()}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body ?? {}),
  });
}

export async function fetchAuthMe(
  accessToken: string,
): Promise<{ ok: true; user: AuthUser } | { ok: false; status: number }> {
  try {
    const response = await fetch(`${requireAppBackendUrl()}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const data = (await response.json()) as { user?: AuthUser };
    if (!data.user?.id) {
      return { ok: false, status: 401 };
    }

    return { ok: true, user: data.user };
  } catch {
    return { ok: false, status: 503 };
  }
}

export async function postRefreshSession(refreshToken: string): Promise<Response> {
  return fetch(`${requireAppBackendUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });
}
