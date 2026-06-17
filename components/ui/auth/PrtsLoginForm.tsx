"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Toast } from "primereact/toast";
import type { LoginMethod } from "@/lib/auth/types";
import { formatContactDisplay, saveOtpFlowData } from "@/lib/auth/storage";
import { useAuth } from "@/app/(full-page)/pharmacy/AuthProvider";
import PrtsFloatingField from "../PrtsFloatingField";
import { loginUser } from "@/services/authService";

export default function PrtsLoginForm() {
  const router = useRouter();
  const { setPending, user } = useAuth();
  const toast = useRef<any>(null);
  const [method, setMethod] = useState<LoginMethod>("email");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    if (!contact.trim()) {
      setError(
        method === "mobile_whatsapp"
          ? "Mobile / WhatsApp number is required."
          : "Email address is required.",
      );
      return false;
    }
    if (method === "mobile_whatsapp") {
      if (contact.replace(/\D/g, "").length < 10) {
        setError("Enter a valid 10-digit Mobile / WhatsApp number.");
        return false;
      }
    } else if (
      !contact.includes("@") &&
      contact.replace(/\D/g, "").length < 10
    ) {
      setError("Enter a valid email address.");
      return false;
    }
    setError("");
    return true;
  };

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const email = method === "email" ? contact.trim() : undefined;
    const mobile =
      method === "mobile_whatsapp"
        ? contact.replace(/\D/g, "").slice(-10)
        : undefined;
    const whatsapp = method === "mobile_whatsapp" ? mobile : undefined;
    const contactDisplay =
      method === "mobile_whatsapp"
        ? formatContactDisplay(undefined, undefined, whatsapp)
        : email!;

    setIsSubmitting(true);

    try {
      const response = await loginUser({
        identifier: contact.trim(),
        channel: method === "mobile_whatsapp" ? "MOBILE_WHATSAPP" : "EMAIL",
      });

      saveOtpFlowData({
        userId: response?.data?.userId ?? "",
        type:   response?.type ?? "LOGIN",
        otpExpiresAt: String(Date.now() + (response?.expiresInSeconds ?? 60) * 1000),
      });

      setPending({
        flow: "login",
        loginMethod: method,
        contactDisplay,
        email,
        mobile,
        whatsapp,
      });

      router.push("/pharmacy/login/verify");
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      const messages: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === "string"
          ? raw.split(",").map((m: string) => m.trim()).filter(Boolean)
          : ["Something went wrong. Please try again."];

      toast.current?.show({
        severity: "error",
        summary: "Login Failed",
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
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-right" appendTo={document.body}/>
      <article className="prts-auth-card">
      <header className="prts-auth-card__header2">
        <span className="prts-auth-card__icon" aria-hidden>
          <Image
            src="/assets/header/welcomeback.svg"
            alt="welcomeback"
            width={24}
            height={24}
          />
        </span>
        <div>
          <h1>
            Welcome back! <br />
            Continue to log in
          </h1>
        </div>
      </header>

      <p className="prts-auth-card__hint">
        Please enter your email address & mobile number or Also <br /> with WhatsApp to receive a 6-digit verification code.
      </p>

      <form className="prts-auth-form" onSubmit={handleContinue} noValidate>
        <div className="prts-auth-toggle">
          <button
            type="button"
            className={`prts-auth-toggle__btn ${method === "email" ? "prts-auth-toggle__btn--active" : ""
              }`}
            onClick={() => setMethod("email")}
          >
            <Image
              src={
                method === "mobile_whatsapp"
                  ? "/assets/header/Email-Icon-Black.svg" // active icon
                  : "/assets/header/Email-Icon.svg" // default icon
              }
              alt="mobile icon"
              width={18}
              height={26}
              aria-hidden="true"
              className="prts-auth-toggle__icon"
            />
            Email Address
          </button>
          <button
            type="button"
            className={`prts-auth-toggle__btn ${method === "mobile_whatsapp" ? "prts-auth-toggle__btn--active" : ""}`}
            onClick={() => setMethod("mobile_whatsapp")}
          >
            <Image
              src={
                method === "mobile_whatsapp"
                  ? "/assets/header/mobile.svg" // active icon
                  : "/assets/header/mobile2.svg" // default icon
              }
              alt="whatsapp"
              width={26}
              height={26}
              aria-hidden="true"
            />
            Mobile or WhatsApp Number
          </button>
        </div>

        <PrtsFloatingField
          label={
            method === "mobile_whatsapp"
              ? "Mobile or WhatsApp Number"
              : "Email Address"
          }
          type={method === "mobile_whatsapp" ? "tel" : "text"}
          value={contact}
          onChange={(value) => {
            if (method === "mobile_whatsapp") {
              const numericValue = value.replace(/\D/g, "").slice(0, 10);
              setContact(numericValue);
            } else {
              setContact(value);
            }
          }}
          required
        />

        {error && (
          <p className="prts-auth-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="prts-btn prts-btn--primary prts-btn--wide"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Please wait..." : "Continue to verification"}
        </button>
      </form>

      <div className="prts-auth-card__demo-hint"></div>
      </article>
    </>
  );
}
