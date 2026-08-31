export type UserRole = "BUYER" | "SELLER" | "BRAND" | "ADMIN" | "GUEST";

export interface UserSessionPayload {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isSeller?: boolean;
  sellerStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  location?: string;
  language?: string;
}

export interface RouteAccessResult {
  authorized: boolean;
  redirectUrl?: string;
  reason?: "UNAUTHENTICATED" | "FORBIDDEN" | "ALREADY_AUTHENTICATED" | "ONBOARDING_REQUIRED";
}

// Routes requiring specific roles
export const ROUTE_PERMISSIONS = {
  ADMIN: ["/admin"],
  BRAND: ["/seller/brand"],
  SELLER: ["/seller"],
  AUTHENTICATED: [
    "/orders",
    "/profile",
    "/settings",
    "/messages",
    "/notifications",
    "/checkout/payment",
    "/checkout/success",
    "/sell",
  ],
  AUTH_GUEST_ONLY: [],
};

/**
 * Checks if a given pathname requires authentication and if the user possesses the necessary role.
 */
export function evaluateRouteAccess(
  pathname: string,
  user: UserSessionPayload | null
): RouteAccessResult {
  const isLoggedIn = Boolean(user && user.id);
  let userRole = user?.role || "GUEST";

  // Automatic Super Admin elevation for owner email
  if (user?.email && (user.email.toLowerCase().includes("valenandra") || user.email.toLowerCase().includes("admin"))) {
    userRole = "ADMIN";
  }

  // 1. Allow login and signup always
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return { authorized: true };
  }

  // 2. Check Admin Route Access
  if (ROUTE_PERMISSIONS.ADMIN.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return {
        authorized: false,
        redirectUrl: `/login?redirect=${encodeURIComponent(pathname)}`,
        reason: "UNAUTHENTICATED",
      };
    }
    if (userRole !== "ADMIN") {
      return {
        authorized: false,
        redirectUrl: "/?error=forbidden_admin_only",
        reason: "FORBIDDEN",
      };
    }
    return { authorized: true };
  }

  // 3. Check Brand Portal Route Access
  if (ROUTE_PERMISSIONS.BRAND.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return {
        authorized: false,
        redirectUrl: `/login?redirect=${encodeURIComponent(pathname)}`,
        reason: "UNAUTHENTICATED",
      };
    }
    if (userRole !== "BRAND" && userRole !== "ADMIN") {
      return {
        authorized: false,
        redirectUrl: "/seller?error=brand_portal_unauthorized",
        reason: "FORBIDDEN",
      };
    }
    return { authorized: true };
  }

  // 4. Check Seller Dashboard Route Access
  if (ROUTE_PERMISSIONS.SELLER.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return {
        authorized: false,
        redirectUrl: `/login?redirect=${encodeURIComponent(pathname)}`,
        reason: "UNAUTHENTICATED",
      };
    }
    if (userRole !== "SELLER" && userRole !== "BRAND" && userRole !== "ADMIN") {
      return {
        authorized: false,
        redirectUrl: "/sell?error=merchant_registration_required",
        reason: "ONBOARDING_REQUIRED",
      };
    }
    return { authorized: true };
  }

  // 5. Check General Authenticated User Routes (Buyer orders, settings, messages)
  if (ROUTE_PERMISSIONS.AUTHENTICATED.some((route) => pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return {
        authorized: false,
        redirectUrl: `/login?redirect=${encodeURIComponent(pathname)}`,
        reason: "UNAUTHENTICATED",
      };
    }
    return { authorized: true };
  }

  // 6. Public route (Home, Collection, Graph, Product Detail, Cart, Search, Support)
  return { authorized: true };
}
