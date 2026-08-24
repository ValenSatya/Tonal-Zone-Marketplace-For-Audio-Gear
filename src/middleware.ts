import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { evaluateRouteAccess, UserSessionPayload } from "@/lib/auth/roles";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip all static files, Next internals, assets, and webhook APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/api/public") ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|ico|css|js|woff2|ttf|txt|csv|xlsx)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Extract Session User from Cookies
  let user: UserSessionPayload | null = null;

  // Method A: Check custom JSON session cookie
  const sessionCookie = request.cookies.get("tonalzone_session")?.value;
  if (sessionCookie) {
    try {
      user = JSON.parse(decodeURIComponent(sessionCookie));
    } catch {
      user = null;
    }
  }

  // Method B: Fallback check for Supabase auth cookie presence
  if (!user) {
    const supabaseAuthCookie = request.cookies
      .getAll()
      .find((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));

    if (supabaseAuthCookie) {
      try {
        const raw = JSON.parse(supabaseAuthCookie.value);
        if (raw && (raw.user || raw.access_token)) {
          const u = raw.user || {};
          const meta = u.user_metadata || {};
          user = {
            id: u.id || "supa-" + Date.now(),
            email: u.email || "user@tonalzone.id",
            name: meta.full_name || meta.name || u.email?.split("@")[0],
            role: (meta.role || "BUYER").toUpperCase(),
            isSeller: meta.role === "SELLER" || meta.is_seller,
            sellerStatus: meta.seller_status || "APPROVED",
          };
        }
      } catch {
        // Continue unauthenticated if malformed
      }
    }
  }

  // 3. Evaluate Route Access Permissions
  const access = evaluateRouteAccess(pathname, user);

  if (!access.authorized && access.redirectUrl) {
    const redirectUrl = new URL(access.redirectUrl, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // 4. Inject High-Standard Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
