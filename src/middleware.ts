import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { evaluateRouteAccess, UserSessionPayload, sanitizeAvatarForCookie } from "@/lib/auth/roles";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip all static files, Next internals, assets, and all API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icon") ||
    pathname.match(/\.(svg|png|jpg|jpeg|webp|ico|css|js|woff2|ttf|txt|csv|xlsx)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Extract Session User from Cookies with auto-heal for bloated cookies
  let user: UserSessionPayload | null = null;
  let needsCookieHeal = false;
  let healedCookieValue = "";

  // Method A: Check custom JSON session cookie
  const sessionCookie = request.cookies.get("tonalzone_session")?.value;
  if (sessionCookie) {
    try {
      const decoded = decodeURIComponent(sessionCookie);
      const isOversized = sessionCookie.length > 1500 || decoded.includes("data:image");
      
      const parsed = JSON.parse(decoded);
      if (isOversized) {
        // Strip out any bloated fields (like base64 avatars) immediately
        parsed.avatar = sanitizeAvatarForCookie(parsed.avatar);
        healedCookieValue = encodeURIComponent(JSON.stringify(parsed));
        needsCookieHeal = true;
      }
      user = parsed;
    } catch {
      user = null;
      needsCookieHeal = true;
      healedCookieValue = "";
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
          const email = u.email || "user@tonalzone.id";
          const isWhitelistedAdmin = email.toLowerCase().includes("valenandra") || email.toLowerCase().includes("admin");
          user = {
            id: u.id || "supa-" + Date.now(),
            email,
            name: meta.full_name || meta.name || email.split("@")[0],
            role: isWhitelistedAdmin ? "ADMIN" : (meta.role || "BUYER").toUpperCase(),
            isSeller: isWhitelistedAdmin || meta.role === "SELLER" || meta.is_seller,
            sellerStatus: meta.seller_status || "APPROVED",
          };
        }
      } catch {
        // Continue unauthenticated if malformed
      }
    }
  }

  // Method C: If user is extracted, check email elevation
  if (user && user.email && (user.email.toLowerCase().includes("valenandra") || user.email.toLowerCase().includes("admin"))) {
    user.role = "ADMIN";
    user.isSeller = true;
  }

  // 3. Evaluate Route Access Permissions
  const access = evaluateRouteAccess(pathname, user);

  if (!access.authorized && access.redirectUrl) {
    const redirectUrl = new URL(access.redirectUrl, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    if (needsCookieHeal) {
      if (healedCookieValue) {
        redirectResponse.cookies.set("tonalzone_session", healedCookieValue, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
        });
      } else {
        redirectResponse.cookies.delete("tonalzone_session");
      }
    }
    return redirectResponse;
  }

  // 4. Inject High-Standard Security Headers
  const response = NextResponse.next();
  if (needsCookieHeal) {
    if (healedCookieValue) {
      response.cookies.set("tonalzone_session", healedCookieValue, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
    } else {
      response.cookies.delete("tonalzone_session");
    }
  }
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
