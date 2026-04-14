import { NextResponse } from "next/server";
import { AUTH_TOKEN_KEY } from "@/utils/auth/constants";
import { jwtRoleIsAdmin } from "@/utils/auth/jwtPayload";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const raw = request.cookies.get(AUTH_TOKEN_KEY)?.value ?? "";
  let token = raw;
  try {
    token = raw ? decodeURIComponent(raw) : "";
  } catch {
    token = raw;
  }

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const adminHint = jwtRoleIsAdmin(token);
  if (adminHint === false) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("error", "forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
