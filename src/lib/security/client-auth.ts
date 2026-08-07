"use client";

import { ROUTES } from "@/constants/routes";

export const API_FETCH_CREDENTIALS: RequestCredentials = "include";

export function withApiCredentials(init?: RequestInit): RequestInit {
  return {
    ...init,
    credentials: API_FETCH_CREDENTIALS,
    cache: init?.cache ?? "no-store",
  };
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(
        ROUTES.API.AUTH.REFRESH,
        withApiCredentials({ method: "POST" }),
      );
      return res.ok;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/**
 * Authenticated fetch with a single 401 → refresh → retry.
 * Use for all Learn APIs that require a session cookie.
 */
export async function authedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, withApiCredentials(init));
  if (res.status !== 401) return res;

  const refreshed = await tryRefreshSession();
  if (!refreshed) return res;

  return fetch(input, withApiCredentials(init));
}

export const AUTH_SESSION_MARKER = "__session__";

export function hasAuthSession(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}

/** Client-safe standalone flag — always false in production builds. */
export function isClientDevStandalone(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const flag = process.env.NEXT_PUBLIC_LEARN_DEV_STANDALONE?.trim().toLowerCase();
  return flag === "true" || flag === "1" || flag === "yes";
}

/** When standalone, auto-login dev user on bootstrap (disable with NEXT_PUBLIC_LEARN_DEV_AUTO_LOGIN=false). */
export function isClientDevAutoLogin(): boolean {
  if (!isClientDevStandalone()) return false;
  const flag = process.env.NEXT_PUBLIC_LEARN_DEV_AUTO_LOGIN?.trim().toLowerCase();
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return true;
}
