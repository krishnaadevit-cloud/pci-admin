/**
 * lib/auth/storage.ts
 *
 * Public API is unchanged — all callers (AuthProvider, OTP components, etc.)
 * continue to import from this file with the same function names.
 *
 * Internals: fully delegated to cookieStorage.ts.
 *   - pci_auth_user       → regular cookie (7-day, base64 JSON, JS-readable)
 *   - pci_pending         → regular cookie (30-min, base64 JSON, JS-readable)
 *   - pci_otp_*           → regular cookies (10-min, plain strings, JS-readable)
 *   - auth_token          → SameSite=Strict cookie (JS-readable; axios interceptor reads it)
 *
 * localStorage is no longer used for any auth state.
 * UI preferences (pci-layout-config, pci-layout-state) remain in localStorage
 * and are intentionally untouched here.
 */

export {
  loadUser,
  saveUser,
  clearUser,
  loadPending,
  savePending,
  clearPending,
  saveOtpFlowData,
  getOtpUserId,
  getOtpType,
  getOtpExpiresAt,
  clearOtpFlowCookies,
  saveAuthToken,
  getAuthToken,
  clearAuthToken,
  getTenantStatus,
} from "./cookieStorage";

// ─── Utility functions (no storage dependency) ────────────────────────────────

export function formatMobile(value: string): string {
  const digits = value.replace(/\D/g, "").slice(-10);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function formatContactDisplay(
  email?: string,
  mobile?: string,
  whatsapp?: string
): string {
  if (whatsapp) return `+91 ${formatMobile(whatsapp)}`;
  if (mobile) return `+91 ${formatMobile(mobile)}`;
  return email ?? "";
}
