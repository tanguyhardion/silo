import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

// Reachable without a session
const PUBLIC_PATHS = new Set(["/login", "/api/auth/login"]);

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const authed = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (PUBLIC_PATHS.has(pathname)) {
    // Already signed in → skip the login screen
    if (authed && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ success: false, error: "Non autorisé." }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.url);
  if (pathname !== "/") loginUrl.searchParams.set("next", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything except Next build assets and the app icons
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico$|icon\\.svg$).*)"],
};
