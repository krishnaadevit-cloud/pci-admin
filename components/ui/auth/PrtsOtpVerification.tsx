"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useAuth } from "@/app/(full-page)/pharmacy/AuthProvider";
import PrtsOtpInput from "../PrtsOtpInput";
import { verifyOtp, resendOtp } from "@/services/authService";
import {
  getOtpUserId,
  getOtpType,
  getOtpExpiresAt,
  saveOtpFlowData,
  clearOtpFlowCookies,
  saveAuthToken,
  saveUser,
  saveTenantStatus,
  clearTenantStatus,
  saveCouncilLogo,
  clearCouncilLogo,
} from "@/lib/auth/cookieStorage";
import type { AuthUser } from "@/lib/auth/types";

interface PrtsOtpVerificationProps {
  flow: "login" | "register";
}

const maskMobile = (mobile?: string) => {
  if (!mobile || mobile.length < 4) return mobile ?? "";
  return mobile.slice(0, 2) + "*** ***" + mobile.slice(-2);
};

const maskEmail = (email?: string) => {
  if (!email || !email.includes("@")) return email ?? "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return email;
  return local[0] + "*".repeat(local.length - 2) + local[local.length - 1] + "@" + domain;
};

export default function PrtsOtpVerification({ flow }: PrtsOtpVerificationProps) {
  const router = useRouter();
  const { pending, setPending, completeLogin } = useAuth();
  const toast = useRef<any>(null);

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(""));
  const [mobileOtp, setMobileOtp] = useState<string[]>(Array(6).fill(""));

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (typeof window === "undefined") return 60;
    const expiresAt = getOtpExpiresAt();
    if (!expiresAt) return 60;
    return Math.max(0, Math.ceil((parseInt(expiresAt) - Date.now()) / 1000));
  });
  const [otpExpired, setOtpExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState("");
  const [mobileOtpError, setMobileOtpError] = useState("");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [otpStatus, setOtpStatus] = useState<"valid" | "invalid" | null>(null);
  const [emailOtpStatus, setEmailOtpStatus] = useState<"valid" | "invalid" | null>(null);
  const [mobileOtpStatus, setMobileOtpStatus] = useState<"valid" | "invalid" | null>(null);

  useEffect(() => {
    if (pending && pending.flow !== flow) {
      router.replace(flow === "login" ? "/pharmacy/login" : "/pharmacy/register");
    }
  }, [pending, flow, router]);

  const startTimer = useCallback((seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSecondsLeft(seconds);
    if (seconds <= 0) return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    const expiresAt = getOtpExpiresAt();
    const remaining = expiresAt
      ? Math.max(0, Math.ceil((parseInt(expiresAt) - Date.now()) / 1000))
      : 60;
    startTimer(remaining);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timerDisplay = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const handleResend = useCallback(async () => {
    if (secondsLeft > 0 && !otpExpired) return;

    if (flow === "register" || flow === "login") {
      const user_id = getOtpUserId();
      const type = getOtpType();
      try {
        const response = await resendOtp({ user_id, type });
        saveOtpFlowData({ otpExpiresAt: String(Date.now() + 60 * 1000) });
        toast.current?.show({
          severity: "success",
          summary: "OTP Resent",
          detail: response?.message || (flow === "register" ? "New OTP sent to your email & mobile." : "New OTP sent successfully."),
          life: 3000,
        });
      } catch (err: any) {
        const raw = err?.response?.data?.message;
        const messages: string[] = Array.isArray(raw)
          ? raw
          : typeof raw === "string"
            ? raw.split(",").map((m: string) => m.trim()).filter(Boolean)
            : ["Failed to resend OTP. Please try again."];
        toast.current?.show({
          severity: "error",
          summary: "Resend Failed",
          detail: (
            <span>
              {messages.map((msg, i) => (
                <span key={i}>{i > 0 && <br />}{msg}</span>
              ))}
            </span>
          ),
          life: 5000,
        });
        return;
      }
    }

    startTimer(60);
    setOtpExpired(false);
    setOtp(Array(6).fill(""));
    setEmailOtp(Array(6).fill(""));
    setMobileOtp(Array(6).fill(""));
    setError("");
    setMobileOtpError("");
    setEmailOtpError("");
    setOtpStatus(null);
  }, [secondsLeft, otpExpired, flow, startTimer]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (flow === "register") {
      const emailCode = emailOtp.join("");
      const mobileCode = mobileOtp.join("");

      let hasError = false;
      if (mobileCode.length !== 6) {
        setMobileOtpError("Please enter the complete 6-digit mobile OTP.");
        hasError = true;
      } else {
        setMobileOtpError("");
      }
      if (emailCode.length !== 6) {
        setEmailOtpError("Please enter the complete 6-digit email OTP.");
        hasError = true;
      } else {
        setEmailOtpError("");
      }
      if (hasError) return;

      const user_id = getOtpUserId();
      const type = getOtpType();

      setIsVerifying(true);
      setError("");
      setMobileOtpError("");
      setEmailOtpError("");

      try {
        await verifyOtp({ user_id, type, email_otp: emailCode, mobile_otp: mobileCode });
        setEmailOtpStatus("valid");
        setMobileOtpStatus("valid");
        clearOtpFlowCookies();
        setTimeout(() => {
          setPending(null);
          router.push("/pharmacy/login");
        }, 800);
      } catch (err: any) {
        const responseData = err?.response?.data;
        if (responseData?.otp_expired === true) {
          setOtpExpired(true);
          setSecondsLeft(0);
        }
        if (responseData?.email_otp_verified !== undefined) {
          setEmailOtpStatus(responseData.email_otp_verified ? "valid" : "invalid");
        }
        if (responseData?.mobile_otp_verified !== undefined) {
          setMobileOtpStatus(responseData.mobile_otp_verified ? "valid" : "invalid");
        }

        const raw = responseData?.message;
        const messages: string[] = Array.isArray(raw)
          ? raw
          : typeof raw === "string"
            ? raw.split(",").map((m: string) => m.trim()).filter(Boolean)
            : ["Verification failed. Please try again."];

        toast.current?.show({
          severity: "error",
          summary: "Verification Failed",
          detail: (
            <span>
              {messages.map((msg, i) => (
                <span key={i}>{i > 0 && <br />}{msg}</span>
              ))}
            </span>
          ),
          life: 5000,
        });
      } finally {
        setIsVerifying(false);
      }
      return;
    }

    // login flow
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    const user_id = getOtpUserId();
    const type = getOtpType();

    setIsVerifying(true);
    setError("");

    try {
      const response = await verifyOtp({ user_id, type, otp: code });

      // DEBUG — remove once token path is confirmed
      console.log('[Auth] OTP verify response:', response);

      // Store the JWT in a SameSite=Strict cookie (JS-readable so the axios
      // interceptor can attach it as Authorization: Bearer <token>).
      const accessToken =
        response?.data?.tokens?.accessToken ??   // { data: { tokens: { accessToken } } }
        response?.data?.accessToken ??           // { data: { accessToken } }
        response?.data?.token ??                 // { data: { token } }
        response?.tokens?.accessToken ??         // { tokens: { accessToken } }
        response?.accessToken ??                 // { accessToken }
        response?.token;                         // { token }

      console.log('[Auth] resolved accessToken:', accessToken);

      if (accessToken) {
        saveAuthToken(accessToken);
        console.log('[Auth] auth_token cookie saved');
      } else {
        console.warn('[Auth] accessToken NOT found in response — auth_token NOT saved. Check response shape above.');
      }

      const userData: AuthUser = response?.data?.user ?? {};
      saveUser(userData);

      clearTenantStatus();
      const tenantStatus = response?.data?.tenantStatus;
      if (tenantStatus) {
        saveTenantStatus(tenantStatus);
      }

      clearCouncilLogo();
      if (userData?.userType === 'STATE_COUNCIL') {
        const logoUrl =
          response?.data?.council_logo_url ??
          response?.data?.user?.council_logo_url ??
          response?.data?.tenantDetails?.council_logo;
        if (logoUrl) saveCouncilLogo(logoUrl);
      }

      clearOtpFlowCookies();
      setIsRedirecting(true);
      completeLogin({
        fullName: userData?.fullName ?? "User",
        email: pending?.email,
        mobile: pending?.mobile,
        whatsapp: pending?.whatsapp,
        userType: userData?.userType,
      });
    } catch (err: any) {
      const responseData = err?.response?.data;
      if (responseData?.otp_expired === true) {
        setOtpExpired(true);
        setSecondsLeft(0);
      }
      setOtpStatus("invalid");
      const raw = responseData?.message;
      const messages: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === "string"
          ? raw.split(",").map((m: string) => m.trim()).filter(Boolean)
          : ["Verification failed. Please try again."];
      toast.current?.show({
        severity: "error",
        summary: "Verification Failed",
        detail: (
          <span>
            {messages.map((msg, i) => (
              <span key={i}>{i > 0 && <br />}{msg}</span>
            ))}
          </span>
        ),
        life: 5000,
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    setPending(null);
    router.push(flow === "login" ? "/pharmacy/login" : "/pharmacy/register");
  };

  if (isRedirecting) {
    return (
      <div className="prts-auth-redirecting">
        <i className="pi pi-spin pi-spinner prts-auth-redirecting__spinner" />
        <span className="prts-auth-redirecting__text">Loading your dashboard…</span>
      </div>
    );
  }

  if (!pending) return null;

  const instruction =
    flow === "register" ? (
      <>
        Please enter the 6-digit codes sent to your <br />
        email address and mobile number.
      </>
    ) : pending.loginMethod === "mobile_whatsapp" ? (
      <>
        Please enter the 6 digit verification code sent to <br />
        your WhatsApp number.
      </>
    ) : pending.email && !pending.mobile ? (
      <>
        Please enter the 6 digit verification code sent to <br />
        your email address.
      </>
    ) : (
      <>
        Please enter the 6 digit verification code sent to <br />
        your Mobile number & email address.
      </>
    );

  return (
    <>
      <Toast ref={toast} position="top-right" appendTo={document.body}/>
      <article className="prts-auth-card">
        <header className="prts-auth-card__header2">
          <span className="prts-auth-card__icon" aria-hidden>
            <Image
              src="/assets/header/password-smartphone.svg"
              alt="mobile"
              width={24}
              height={24}
            />
          </span>
          <h1>
            Enter 6-digit
            <br /> verification code.
          </h1>
        </header>

        <p className="prts-auth-card__hint">{instruction}</p>

        <form className="prts-auth-form2" onSubmit={handleVerify} noValidate>
          {flow === "register" ? (
            <>
              <div className="prts-otp-label-row">
                <p className="prts-float-field__phone-label">Mobile/WhatsApp Number <span className="prts-auth-error">*</span></p>
                <span className="prts-otp-label-contact">{maskMobile(pending.mobile)}</span>
              </div>
              <div className="prts-otp-input-row">
                <PrtsOtpInput value={mobileOtp} onChange={(v) => { setMobileOtp(v); setMobileOtpStatus(null); setMobileOtpError(""); }} />
                {mobileOtpStatus && (
                  <i className={`pi ${mobileOtpStatus === "valid" ? "pi-check-circle prts-otp-status--valid" : "pi-times-circle prts-otp-status--invalid"} prts-otp-status`} />
                )}
              </div>
              {mobileOtpError && <p className="prts-auth-error" role="alert">{mobileOtpError}</p>}
              <div className="prts-otp-label-row">
                <p className="prts-float-field__phone-label">Email Address <span className="prts-auth-error">*</span></p>
                <span className="prts-otp-label-contact">{maskEmail(pending.email)}</span>
              </div>
              <div className="prts-otp-input-row">
                <PrtsOtpInput value={emailOtp} onChange={(v) => { setEmailOtp(v); setEmailOtpStatus(null); setEmailOtpError(""); }} />
                {emailOtpStatus && (
                  <i className={`pi ${emailOtpStatus === "valid" ? "pi-check-circle prts-otp-status--valid" : "pi-times-circle prts-otp-status--invalid"} prts-otp-status`} />
                )}
              </div>
              {emailOtpError && <p className="prts-auth-error" role="alert">{emailOtpError}</p>}
            </>
          ) : (
            <div className="prts-otp-input-row">
              <PrtsOtpInput value={otp} onChange={(v) => { setOtp(v); setOtpStatus(null); }} />
              {otpStatus && (
                <i className={`pi ${otpStatus === "valid" ? "pi-check-circle prts-otp-status--valid" : "pi-times-circle prts-otp-status--invalid"} prts-otp-status`} />
              )}
            </div>
          )}

          {error && (
            <p className="prts-auth-error" role="alert">
              {error}
            </p>
          )}

          <div className="prts-auth-otp-meta">
            {secondsLeft > 0 ? (
              <span className="prts-auth-otp-timer">
                <i className="pi pi-spin pi-spinner" aria-hidden />
                {timerDisplay}
              </span>
            ) : <span className="prts-auth-otp-timer"></span>}
            <button
              type="button"
              className={`prts-auth-resend ${(secondsLeft === 0 || otpExpired) ? "prts-auth-resend--active" : ""}`}
              onClick={handleResend}
              disabled={secondsLeft > 0 && !otpExpired}
            >
              Resend OTP
            </button>
          </div>

          <div className="prts-auth-actions">
            <button
              type="submit"
              className="prts-btn prts-btn--primary"
              disabled={isVerifying}
            >
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              className="prts-btn prts-btn--outline"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </article>
    </>
  );
}
