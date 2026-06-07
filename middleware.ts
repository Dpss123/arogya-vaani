import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// No route is gated behind login anymore — the whole product is open so the
// demo flows end-to-end. Login (Google, for doctors) stays available but
// optional; visiting /login while already signed in just bounces to /home.
const AUTH_ONLY = ["/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;

  if (AUTH_ONLY.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login"],
};
