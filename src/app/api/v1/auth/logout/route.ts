import { NextResponse } from "next/server";

import { clearAuthCookieHeaders } from "@/lib/security/auth-cookies";

export async function POST() {
  const headers = new Headers();
  for (const cookie of clearAuthCookieHeaders()) {
    headers.append("Set-Cookie", cookie);
  }
  return NextResponse.json({ ok: true }, { headers });
}
