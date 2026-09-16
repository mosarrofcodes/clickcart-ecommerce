import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protected routes that require authentication
  const protectedRoutes = ["/checkout", "/orders", "/profile", "/admin"];
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  // If route is protected and user is not authenticated
  if (isProtected && !req.auth) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|opengraph-image|twitter-image).*)",
  ],
};