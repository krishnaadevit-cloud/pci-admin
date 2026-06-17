"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { clearPending, clearUser, loadPending, loadUser, savePending, saveUser, clearOtpFlowCookies, clearAuthToken, getTenantStatus } from "@/lib/auth/storage";
import { AuthUser, PendingVerification, RegistrationDraft, UserType } from "@/lib/auth/types";
import { store } from "@/store/store";
import { resetAllRegistration } from "@/store/slices";


interface AuthContextValue {
  user: AuthUser | null;
  pending: PendingVerification | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setPending: (pending: PendingVerification | null) => void;
  completeRegistration: (draft: RegistrationDraft) => void;
  completeLogin: (contact: Pick<AuthUser, "email" | "mobile" | "whatsapp" | "fullName"> & { userType?: UserType }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_PAGES = [
  "/pharmacy/login",
  "/pharmacy/login/verify",
  "/pharmacy/register",
  "/pharmacy/register/verify",
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pending, setPendingState] = useState<PendingVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(loadUser());
    setPendingState(loadPending());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
      if (user.userType === "STATE_COUNCIL") {
        router.replace("/office-portal/dashboard");
      } else {
        router.replace("/pharmacy/dashboard");
      }
    }
  }, [isLoading, user, pathname, router]);

  const setPending = useCallback((value: PendingVerification | null) => {
    if (value) {
      savePending(value);
    } else {
      clearPending();
    }
    setPendingState(value);
  }, []);

  const completeRegistration = useCallback(
    (draft: RegistrationDraft) => {
      const authUser: AuthUser = {
        fullName: draft.fullName,
        email: draft.email,
        mobile: draft.mobile,
        whatsapp: draft.whatsapp,
        stateCouncil: draft.stateCouncil,
        registrationNumber: draft.registrationNumber,
        isPharmacistRegistered: draft.isPharmacistRegistered,
      };
      saveUser(authUser);
      clearPending();
      setUser(authUser);
      setPendingState(null);
      router.push("/pharmacy/dashboard");
    },
    [router]
  );

  const completeLogin = useCallback(
    (contact: Pick<AuthUser, "email" | "mobile" | "whatsapp" | "fullName"> & { userType?: UserType }) => {
      const existing = loadUser();
      const authUser: AuthUser = {
        isPharmacistRegistered: "no",
        ...existing,
        fullName:  existing?.fullName ?? "Registered User",
        email:  existing?.email,
        mobile:  existing?.mobile,
        whatsapp:existing?.whatsapp,
        userType: existing?.userType,
      };
      saveUser(authUser);
      clearPending();
      setUser(authUser);
      setPendingState(null);
      if (getTenantStatus() === "CONFIGURABLE") {
        router.push("/office-portal/onboarding");
      } else if (existing?.userType === "STATE_COUNCIL") {
        router.push("/office-portal/dashboard");
      } else {
        router.push("/pharmacy/dashboard");
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    // Clear the auth token cookie directly (SameSite=Strict, JS-readable).
    clearAuthToken();
    // Clear auth cookies (pci_auth_user, pci_pending).
    clearUser();
    clearPending();
    // Clear any leftover OTP flow cookies (safety net).
    clearOtpFlowCookies();
    setUser(null);
    setPendingState(null);
    // Reset registration form state so the next user starts with a clean slate.
    store.dispatch(resetAllRegistration());
    // localStorage is intentionally NOT cleared here — pci-layout-config,
    // pci-layout-state and timezone preferences are preserved across sessions.
    router.push("/pharmacy/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      pending,
      isAuthenticated: !!user,
      isLoading,
      setPending,
      completeRegistration,
      completeLogin,
      logout,
    }),
    [user, pending, isLoading, setPending, completeRegistration, completeLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
