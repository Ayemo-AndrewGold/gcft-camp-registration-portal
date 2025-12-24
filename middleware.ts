import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminToken = request.cookies.get("admin_token")?.value;
  const portalToken = request.cookies.get("portal_token")?.value;

  /* ---------------- ADMIN PROTECTION ---------------- */
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/login") &&
    !adminToken
  ) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
  }

  /* ---------------- PORTAL PROTECTION ---------------- */
  if (
    pathname.startsWith("/portal") &&
    !pathname.startsWith("/portal/login") &&
    !portalToken
  ) {
    return NextResponse.redirect(
      new URL("/portal/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
