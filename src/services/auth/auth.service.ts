import { learnServiceKey, requireAppBackendUrl } from "@/lib/env";
import type { AuthUser } from "@/lib/security/require-user";
import type { CredentialsLoginInput, MpinLoginInput } from "@/validations/auth.schema";

export async function postGoogleAuth(body: unknown): Promise<Response> {
  return fetch(`${requireAppBackendUrl()}/api/v1/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify(body ?? {}),
  });
}

export async function postCredentialsAuth(body: CredentialsLoginInput): Promise<Response> {
  return fetch(`${requireAppBackendUrl()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ email: body.email, password: body.password }),
  });
}

export async function postMpinAuth(body: MpinLoginInput): Promise<Response> {
  return fetch(`${requireAppBackendUrl()}/api/v1/auth/login/mpin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({ email: body.email, mpin: body.mpin }),
  });
}

/** Optional SSO: exchange one-time handoff code from the main Alvest app. */
export async function postHandoffExchange(code: string): Promise<Response> {
  const serviceKey = learnServiceKey();
  if (!serviceKey) {
    throw new Error("Missing LEARN_SERVICE_KEY.");
  }

  return fetch(`${requireAppBackendUrl()}/api/v1/learn/handoff/exchange`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Learn-Service-Key": serviceKey,
    },
    cache: "no-store",
    body: JSON.stringify({ code }),
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
