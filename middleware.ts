import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const publicPaths = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/setup",
  "/accept-invite",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public path
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Get auth token from cookie
  const token = request.cookies.get("access_token")?.value;

  // If no token and trying to access protected route, redirect to login
  // But NOT if we're going to /setup - the client-side auth will handle setup check
  if (!token && !isPublicPath && pathname !== "/") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If token exists and trying to access public auth pages (except setup and accept-invite), redirect to dashboard
  // Allow accept-invite for logged-in users so admins can test invite links
  if (token && isPublicPath && pathname !== "/setup" && !pathname.startsWith("/accept-invite")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

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
