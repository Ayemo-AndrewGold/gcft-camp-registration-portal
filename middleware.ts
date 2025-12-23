// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies
  const adminToken = request.cookies.get("admin_token")?.value;

  // Protect dashboard routes
  const isDashboardRoute = pathname.startsWith("/admin");

  // Allow access to login page always
  const isAuthPage = pathname.startsWith("/admin/login");

  // If not logged in & trying to access admin pages
  if (isDashboardRoute && !isAuthPage && !adminToken) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
