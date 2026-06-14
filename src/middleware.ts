import { NextRequest, NextResponse } from "next/server";

import { SESSION_HINT_COOKIE } from "@/lib/security/auth-cookies";

const PUBLIC_PATHS = new Set([
  "/login",
  "/api/health",
  "/api/v1/auth/google",
  "/api/v1/auth/dev-login",
  "/api/v1/enrollment/preview",
]);

function isDevStandalone(): boolean {
  const flag = process.env.LEARN_DEV_STANDALONE?.trim().toLowerCase();
  return flag === "true" || flag === "1" || flag === "yes";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Local dev mode — home page is public so the course catalog is visible before login
  if (isDevStandalone() && pathname === "/") {
    return NextResponse.next();
  }

  const hint = request.cookies.get(SESSION_HINT_COOKIE)?.value;
  if (!hint) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname || "/");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|static|favicon.ico).*)"],
};
