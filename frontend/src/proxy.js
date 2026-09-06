import { NextResponse } from "next/server";
import { getAuthCookie, isTokenExpired } from "@/lib/auth";

// Optimistic server-side guard for admin routes. The backend still enforces
// authentication on every API call; this only prevents unauthenticated users
// from receiving the admin HTML shell.
export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = getAuthCookie(request);
  if (!token || isTokenExpired(token)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};