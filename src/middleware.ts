import { NextRequest, NextResponse } from "next/server";

import { SESSION_HINT_COOKIE } from "@/lib/security/auth-cookies";

const PUBLIC_PATHS = new Set(["/login", "/api/auth/google", "/api/health"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.has(pathname)) {
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
