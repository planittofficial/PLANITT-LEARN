"use client";

export const API_FETCH_CREDENTIALS: RequestCredentials = "include";

export function withApiCredentials(init?: RequestInit): RequestInit {
  return {
    ...init,
    credentials: API_FETCH_CREDENTIALS,
    cache: init?.cache ?? "no-store",
  };
}

export const AUTH_SESSION_MARKER = "__session__";

export function hasAuthSession(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}
