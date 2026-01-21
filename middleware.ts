import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const publicPaths = [
  "/login",
  "/forgot-password",
  "/reset-password",
];

// Paths that require librarian or admin role
const librarianPaths = [
  "/students",
  "/reports",
];

// Paths that require admin role only
const adminPaths = [
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public path
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Get auth token from cookie
  const token = request.cookies.get("access_token")?.value;

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists and trying to access public auth pages, redirect to dashboard
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // For role-based access, we'll handle it client-side since we can't decode JWT in edge middleware
  // without additional configuration. The auth guard component will handle role checks.

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
