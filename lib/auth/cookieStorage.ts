import Cookies from "js-cookie";
import type { AuthUser, PendingVerification } from "./types";

// ─── Cookie name constants ────────────────────────────────────────────────────
export const COOKIE_NAMES = {
  AUTH_TOKEN: "auth_token",      // JWT access token (SameSite=Strict, NOT HttpOnly so axios can read it)
  USER:       "auth_user",   // JS-readable user profile (base64-encoded JSON)
  PENDING:    "pending",     // JS-readable pending verification state (base64-encoded JSON)
  USER_UID:    "user_uid",     // Temp userId during OTP flow
  OTP_TYPE:   "otp_type",    // Temp type (LOGIN/REGISTER) during OTP flow
  OTP_EXP:    "otp_exp",     // OTP expiry timestamp
  OTP_REG:    "otp_reg",     // Registration payload during OTP flow
} as const;

const isSecure = (): boolean =>
  typeof window !== "undefined" && window.location.protocol === "https:";

const BASE_OPTS: Cookies.CookieAttributes = {
  sameSite: "Strict",
  path: "/",
};

// ─── Auth User (7-day expiry, base64-encoded to avoid URI issues in middleware) ─

export function loadUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = Cookies.get(COOKIE_NAMES.USER);
    if (!raw) return null;
    return JSON.parse(atob(raw)) as AuthUser;
  } catch {
    return null;
  }
}

export function saveUser(user: AuthUser): void {
  Cookies.set(COOKIE_NAMES.USER, btoa(JSON.stringify(user)), {
    ...BASE_OPTS,
    secure: isSecure(),
    expires: 7, // 7 days
  });
}

export function clearUser(): void {
  Cookies.remove(COOKIE_NAMES.USER, { path: "/" });
}

// ─── Pending Verification (30-minute expiry) ──────────────────────────────────

export function loadPending(): PendingVerification | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = Cookies.get(COOKIE_NAMES.PENDING);
    if (!raw) return null;
    return JSON.parse(atob(raw)) as PendingVerification;
  } catch {
    return null;
  }
}

export function savePending(pending: PendingVerification): void {
  Cookies.set(COOKIE_NAMES.PENDING, btoa(JSON.stringify(pending)), {
    ...BASE_OPTS,
    secure: isSecure(),
    expires: 1 / 48, // 30 minutes (1/48 of a day)
  });
}

export function clearPending(): void {
  Cookies.remove(COOKIE_NAMES.PENDING, { path: "/" });
}

// ─── OTP Flow Temporaries (10-minute expiry) ──────────────────────────────────
// Set after the login/register API call, cleared immediately after OTP verify.

export function saveOtpFlowData(data: {
  userId?: string;
  type?: string;
  otpExpiresAt?: string;
  registrationPayload?: string;
}): void {
  const opts: Cookies.CookieAttributes = {
    ...BASE_OPTS,
    secure: isSecure(),
    expires: 1 / 144, // 10 minutes (1/144 of a day)
  };
  if (data.userId !== undefined)
    Cookies.set(COOKIE_NAMES.USER_UID, data.userId, opts);
  if (data.type !== undefined)
    Cookies.set(COOKIE_NAMES.OTP_TYPE, data.type, opts);
  if (data.otpExpiresAt !== undefined)
    Cookies.set(COOKIE_NAMES.OTP_EXP, data.otpExpiresAt, opts);
  if (data.registrationPayload !== undefined)
    Cookies.set(COOKIE_NAMES.OTP_REG, data.registrationPayload, opts);
}

export function getOtpUserId(): string | null {
  return Cookies.get(COOKIE_NAMES.USER_UID) ?? null;
}

export function getOtpType(): string | null {
  return Cookies.get(COOKIE_NAMES.OTP_TYPE) ?? null;
}

export function getOtpExpiresAt(): string | null {
  return Cookies.get(COOKIE_NAMES.OTP_EXP) ?? null;
}

export function clearOtpFlowCookies(): void {
  Cookies.remove(COOKIE_NAMES.USER_UID,  { path: "/" });
  Cookies.remove(COOKIE_NAMES.OTP_TYPE, { path: "/" });
  Cookies.remove(COOKIE_NAMES.OTP_EXP,  { path: "/" });
  Cookies.remove(COOKIE_NAMES.OTP_REG,  { path: "/" });
}

// ─── Auth Token (7-day expiry, SameSite=Strict, JS-readable so axios can attach it) ─
// Note: NOT HttpOnly — the axios request interceptor reads it to set Authorization header.
// SameSite=Strict still protects against CSRF attacks.

export function saveAuthToken(token: string): void {
  Cookies.set(COOKIE_NAMES.AUTH_TOKEN, token, {
    ...BASE_OPTS,
    secure: isSecure(),
    expires: 7, // 7 days
  });
}

export function getAuthToken(): string | null {
  return Cookies.get(COOKIE_NAMES.AUTH_TOKEN) ?? null;
}

export function clearAuthToken(): void {
  Cookies.remove(COOKIE_NAMES.AUTH_TOKEN, { path: "/" });
}

// ─── Tenant Status (7-day expiry, JS-readable for sidebar filtering) ──────────

const TENANT_STATUS_KEY = "tenant_status";

export function saveTenantStatus(status: string): void {
  Cookies.set(TENANT_STATUS_KEY, status, {
    ...BASE_OPTS,
    secure: isSecure(),
    expires: 7,
  });
}

export function getTenantStatus(): string | null {
  return Cookies.get(TENANT_STATUS_KEY) ?? null;
}

export function clearTenantStatus(): void {
  Cookies.remove(TENANT_STATUS_KEY, { path: "/" });
}

// ─── Council Logo URL (7-day expiry, shown in topbar for STATE_COUNCIL users) ──

const COUNCIL_LOGO_KEY = "council_logo_url";

export function saveCouncilLogo(url: string): void {
  Cookies.set(COUNCIL_LOGO_KEY, url, {
    ...BASE_OPTS,
    secure: isSecure(),
    expires: 7,
  });
}

export function getCouncilLogo(): string | null {
  return Cookies.get(COUNCIL_LOGO_KEY) ?? null;
}

export function clearCouncilLogo(): void {
  Cookies.remove(COUNCIL_LOGO_KEY, { path: "/" });
}
