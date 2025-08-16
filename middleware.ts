import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip middleware for setup page
  if (request.nextUrl.pathname.startsWith("/setup")) {
    return NextResponse.next();
  }

  // Skip middleware for login page
  if (request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // Skip middleware for home page (it handles redirection itself)
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - setup (setup page)
     * - login (login page)
     */
    "/((?!_next/static|_next/image|favicon.ico|setup|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
