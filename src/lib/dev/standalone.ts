import { applyAuthCookies } from "@/lib/security/auth-cookies";
import { devMockEnrollments, devMockUser, isDevStandalone } from "@/lib/env";
import { NextResponse } from "next/server";

/** Fixed tokens used only when LEARN_DEV_STANDALONE is enabled (never in production). */
export const DEV_ACCESS_TOKEN = "learn-dev-standalone-access";
export const DEV_REFRESH_TOKEN = "learn-dev-standalone-refresh";

export function isDevAccessToken(token: string | undefined): boolean {
  if (!isDevStandalone()) return false;
  return Boolean(token && token === DEV_ACCESS_TOKEN);
}

export function isDevRefreshToken(token: string | undefined): boolean {
  if (!isDevStandalone()) return false;
  return Boolean(token && token === DEV_REFRESH_TOKEN);
}

export function devAuthMeResponse(): NextResponse {
  const user = devMockUser();
  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}

export function devLoginResponse(): NextResponse {
  const user = devMockUser();
  const headers = applyAuthCookies({
    accessToken: DEV_ACCESS_TOKEN,
    refreshToken: DEV_REFRESH_TOKEN,
  });
  return NextResponse.json(
    {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    },
    { headers },
  );
}

export function devRefreshResponse(): NextResponse {
  const headers = applyAuthCookies({
    accessToken: DEV_ACCESS_TOKEN,
    refreshToken: DEV_REFRESH_TOKEN,
  });
  return NextResponse.json({ ok: true }, { headers });
}

export function devPaymentHistoryResponse(): NextResponse {
  const items = devMockEnrollments().map((plan_id) => ({
    plan_id,
    status: "paid",
  }));
  return NextResponse.json({ items });
}

/** Guard for dev-only API routes — returns 404 in production or when standalone is off. */
export function devStandaloneUnavailable(): NextResponse | null {
  if (!isDevStandalone()) {
    return NextResponse.json({ ok: false, detail: "Not found." }, { status: 404 });
  }
  return null;
}
