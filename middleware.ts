import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js root middleware — Server-side route guards only.
 *
 * Authorization header injection is NOT done here.
 * The axios request interceptor (config/axiosInstance.tsx) reads the
 * SameSite=Strict auth_token cookie directly and attaches it as
 * Authorization: Bearer <token> on every outbound request.
 * This keeps the Next.js async rewrites (next.config.js) fully intact —
 * calling NextResponse.next({ request: { headers } }) inside middleware
 * bypasses async rewrites, which would break the /proxy/* → devtunnel routing.
 *
 * Route guards:
 *   /office-portal/*                     → requires auth_token + STATE_COUNCIL role
 *   /pharmacy/dashboard/*                → requires auth_token (any authenticated user)
 *   /pharmacy/fresh-registration/*       → requires auth_token
 *   /pharmacy/renewal/*                  → requires auth_token
 *   /pharmacy/re-entry/*                 → requires auth_token
 *   /pharmacy/add-qualification/*        → requires auth_token
 *   /pharmacy/change-address/*           → requires auth_token
 *   /pharmacy/change-name/*              → requires auth_token
 *   /pharmacy/duplicate-certificate/*    → requires auth_token
 *   /pharmacy/good-standing-certificate/*→ requires auth_token
 *   /pharmacy/login|register/*           → redirect authenticated users to their dashboard
 *
 * NOTE: application_status eligibility checks are client-side only (useDashboardGuard hook)
 * because the status requires an API call that middleware cannot make.
 */

const PHARMACY_AUTH_PATHS = [
  "/pharmacy/login",
  "/pharmacy/register",
  "/pharmacy/login/verify",
  "/pharmacy/register/verify",
];

// Routes a CONFIGURABLE tenant is allowed to visit (onboarding + all step targets).
const ONBOARDING_ALLOWED_PREFIXES = [
  "/office-portal/onboarding",
  "/office-portal/change-password",
  "/office-portal/registrar-signature",
  "/office-portal/scrutiny/configuration",
  "/office-portal/master/documents",
  "/office-portal/master/application-document-master",
  "/office-portal/master/hospital-application",
  "/office-portal/master/board-application",
  "/office-portal/fee-structure",
  "/office-portal/role-permission/role-management",
  "/office-portal/role-permission/role-configuration",
  "/office-portal/role-permission/user-management",
];

function isOnboardingAllowed(pathname: string): boolean {
  return ONBOARDING_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token        = request.cookies.get("auth_token")?.value;
  const userRaw      = request.cookies.get("auth_user")?.value;
  const tenantStatus = request.cookies.get("tenant_status")?.value;

  // ── 1. Office-portal: requires auth_token + STATE_COUNCIL role ────────────
  if (pathname.startsWith("/office-portal")) {
    if (!token) {
      return NextResponse.redirect(new URL("/pharmacy/login", request.url));
    }
    try {
      // pci_auth_user is base64-encoded JSON — decode it to read userType.
      const user = userRaw ? JSON.parse(atob(userRaw)) : null;
      if (user?.userType !== "STATE_COUNCIL") {
        return NextResponse.redirect(new URL("/pharmacy/dashboard", request.url));
      }
      // CONFIGURABLE tenants may only access onboarding and its linked step pages.
      if (tenantStatus === "CONFIGURABLE" && !isOnboardingAllowed(pathname)) {
        return NextResponse.redirect(new URL("/office-portal/onboarding", request.url));
      }
    } catch {
      // Malformed cookie — treat as unauthenticated.
      return NextResponse.redirect(new URL("/pharmacy/login", request.url));
    }
  }

  // ── 1.5. PCI Admin: requires auth_token ───────────────────────────────────
  if (pathname.startsWith("/pci-admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/pharmacy/login", request.url));
    }
  }

  // ── 2. Pharmacy protected pages: require any authenticated user ───────────
  if (
    pathname.startsWith("/pharmacy/dashboard") ||
    pathname.startsWith("/pharmacy/fresh-registration") ||
    pathname.startsWith("/pharmacy/renewal") ||
    pathname.startsWith("/pharmacy/re-entry") ||
    pathname.startsWith("/pharmacy/add-qualification") ||
    pathname.startsWith("/pharmacy/change-address") ||
    pathname.startsWith("/pharmacy/change-name") ||
    pathname.startsWith("/pharmacy/duplicate-certificate") ||
    pathname.startsWith("/pharmacy/good-standing-certificate")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/pharmacy/login", request.url));
    }
  }

  // ── 3. Auth pages: redirect already-logged-in users to their dashboard ────
  if (PHARMACY_AUTH_PATHS.some((p) => pathname.startsWith(p))) {
    if (token) {
      try {
        const user = userRaw ? JSON.parse(atob(userRaw)) : null;
        if (user?.userType === "STATE_COUNCIL") {
          const dest =
            tenantStatus === "CONFIGURABLE"
              ? "/office-portal/onboarding"
              : "/office-portal/dashboard";
          return NextResponse.redirect(new URL(dest, request.url));
        }
        return NextResponse.redirect(new URL("/pharmacy/dashboard", request.url));
      } catch {
        // Corrupted cookie — let them reach the login page.
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/office-portal/:path*",
    "/pci-admin/:path*",
    "/pharmacy/dashboard/:path*",
    "/pharmacy/fresh-registration/:path*",
    "/pharmacy/renewal/:path*",
    "/pharmacy/re-entry/:path*",
    "/pharmacy/add-qualification/:path*",
    "/pharmacy/change-address/:path*",
    "/pharmacy/change-name/:path*",
    "/pharmacy/duplicate-certificate/:path*",
    "/pharmacy/good-standing-certificate/:path*",
    "/pharmacy/login/:path*",
    "/pharmacy/register/:path*",
  ],
};
