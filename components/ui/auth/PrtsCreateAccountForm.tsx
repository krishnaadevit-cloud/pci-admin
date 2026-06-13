"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";

import type { PharmacistRegistered, RegistrationDraft } from "@/lib/auth/types";
import { formatContactDisplay, saveOtpFlowData } from "@/lib/auth/storage";
import { useAuth } from "@/app/(full-page)/pharmacy/AuthProvider";
import PrtsFloatingField, { PrtsFloatingPhone, PrtsFloatingSelect } from "../PrtsFloatingField";
import { getTenants, registerUser } from "@/services/authService";

const MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const initialDraft = (): RegistrationDraft => ({
  isPharmacistRegistered: "no",
  registrationNumber: "",
  fullName: "",
  stateCouncil: "",
  dateOfBirth: "",
  email: "",
  confirmEmail: "",
  mobile: "",
  whatsapp: "",
});

export default function PrtsCreateAccountForm() {
  const router = useRouter();
  const { setPending } = useAuth();
  const [registered, setRegistered] = useState<PharmacistRegistered>("no");
  const [draft, setDraft] = useState<RegistrationDraft>(initialDraft);
  const toast = useRef<any>(null);
  const [councilOptions, setCouncilOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegistrationDraft, string>>
  >({});
  const [hasBhsNo, setHasBhsNo] = useState<"yes" | "no">("no");
  const [bhsNumber, setBhsNumber] = useState("");
  const [bhsNumberError, setBhsNumberError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getTenants()
      .then((data: any[]) => {
        const options = (data ?? []).map((t) => ({ label: t.councilName, value: t.uuid }));
        setCouncilOptions(options);
        if (options.length > 0) {
          setDraft((prev) => ({ ...prev, stateCouncil: options[0].value }));
        }
      })
      .catch(() => {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to load state council list.",
          life: 4000,
        });
      });
  }, []);

  const update = <K extends keyof RegistrationDraft>(
    key: K,
    value: RegistrationDraft[K],
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof RegistrationDraft, string>> = {};

    if (!draft.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }
    if (!draft.stateCouncil) {
      errors.stateCouncil = "State council is required.";
    }
    if (registered === "yes") {
      if (!draft.registrationNumber?.trim()) {
        errors.registrationNumber = "Registration number is required.";
      }
      if (!draft.dateOfBirth?.trim()) {
        errors.dateOfBirth = "Date of birth is required.";
      }
    } else {
      if (!draft.email?.trim() || !EMAIL_REGEX.test(draft.email.trim())) {
        errors.email = "Enter a valid email address.";
      }
      if (!errors.email && draft.email !== draft.confirmEmail) {
        errors.confirmEmail = "Email addresses do not match.";
      }
      if (!draft.mobile || !MOBILE_REGEX.test(draft.mobile)) {
        errors.mobile = "Enter a valid 10-digit mobile number.";
      }
    }

    let bhsErr = "";
    if (registered === "no" && hasBhsNo === "yes" && !bhsNumber.trim()) {
      bhsErr = "BHS Number is required.";
    }

    setFieldErrors(errors);
    setBhsNumberError(bhsErr);
    return Object.keys(errors).length === 0 && !bhsErr;
  };

  const goToOtp = (registrationData: RegistrationDraft) => {
    const { email, mobile } = registrationData;
    const contactDisplay =
      registrationData.isPharmacistRegistered === "no"
        ? `${formatContactDisplay(email, mobile)} or ${email}`
        : "your registered mobile number & email address";

    setPending({
      flow: "register",
      contactDisplay,
      email,
      mobile,
      registrationData,
    });
    router.push("/pharmacy/register/verify");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      let payload: any;

      if (registered === "no") {
        payload = {
          tenant_uuid: draft.stateCouncil,
          full_name: draft.fullName.trim(),
          email: draft.email.trim(),
          mobile: draft.mobile,
          whatsapp_number: draft.whatsapp,
          ...(hasBhsNo === "yes" && { bhs_number: bhsNumber.trim() }),
        };
      } else {
        const { confirmEmail, stateCouncil, ...rest } = {
          ...draft,
          isPharmacistRegistered: registered,
        };

        payload = { ...rest, tenant_uuid: stateCouncil };
      }

      saveOtpFlowData({ registrationPayload: JSON.stringify(payload) });

      const response = await registerUser(payload);

      saveOtpFlowData({
        userId: response?.data?.userId ?? "",
        type: response?.type ?? "REGISTER",
        otpExpiresAt: String(Date.now() + 180 * 1000),
      });

      setPending({
        flow: "register",
        contactDisplay: draft.email ?? draft.mobile ?? "",
        email: draft.email,
        mobile: draft.mobile,
      });

      // ✅ Show success toast
      toast.current?.show({
        severity: "success",
        summary: "Registration Successful",
        detail:
          response?.message || "OTP sent to your email & mobile successfully.",
        life: 3000,
      });

      // ✅ Delay before redirect
      setTimeout(() => {
        router.push("/pharmacy/register/verify");
      }, 2000); // 2 sec delay
    } catch (error: any) {
      const raw = error?.response?.data?.message;

      const messages: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === "string"
        ? raw
            .split(",")
            .map((m: string) => m.trim())
            .filter(Boolean)
        : ["Something went wrong. Please try again."];

      messages.forEach((msg) => {
        toast.current?.show({
          severity: "error",
          summary: "Registration Failed",
          detail: msg,
          life: 5000,
        });
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <article className="prts-auth-card">
        <header className="prts-auth-card__header">
          <span className="prts-auth-card__icon" aria-hidden>
            <Image
              src="/assets/header/portrait.svg"
              alt="portrait"
              width={24}
              height={24}
            />
          </span>
          <h1>Create an account</h1>
        </header>

        <form className="prts-auth-form" onSubmit={onSubmit} noValidate>
          <fieldset className="prts-auth-radio-group">
            <div className="prts-auth-radio-row">
              <legend>You have already Pharmacist registered:</legend>
              <label
                className={`prts-auth-radio-option yes ${registered === "yes" ? "prts-auth-radio-option--active" : ""}`}
              >
                <input
                  type="radio"
                  name="pharmacistRegistered"
                  checked={registered === "yes"}
                  onChange={() => {
                    setRegistered("yes");
                    update("isPharmacistRegistered", "yes");
                    setFieldErrors({});
                    setHasBhsNo("no");
                    setBhsNumber("");
                  }}
                />
                Yes
              </label>
              <label
                className={`prts-auth-radio-option ${
                  registered === "no" ? "prts-auth-radio-option--active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="pharmacistRegistered"
                  checked={registered === "no"}
                  onChange={() => {
                    setRegistered("no");
                    update("isPharmacistRegistered", "no");
                    setFieldErrors({});
                  }}
                />
                No
              </label>
            </div>
          </fieldset>

          {registered === "yes" ? (
            <>
              <PrtsFloatingSelect
                label="State Council"
                value={draft.stateCouncil}
                onChange={(v) => update("stateCouncil", v)}
                options={councilOptions}
                required
                error={fieldErrors.stateCouncil}
              />
              <PrtsFloatingField
                label="Registration No."
                type="number"
                placeholder="Enter your Reg. No"
                value={draft.registrationNumber ?? ""}
                onChange={(v) => update("registrationNumber", v)}
                required
                error={fieldErrors.registrationNumber}
              />
              <PrtsFloatingField
                label="Full Name"
                value={draft.fullName}
                onChange={(v) => {
                  const onlyText = v.replace(/[^a-zA-Z\s]/g, ""); // ✅ allow only letters + space
                  update("fullName", onlyText);
                }}
                placeholder="Enter your full name"
                required
                error={fieldErrors.fullName}
              />
              <PrtsFloatingField
                type="date"
                label="Date of Birth"
                value={draft.dateOfBirth ?? ""}
                onChange={(v) => update("dateOfBirth", v)}
                onClick={(e) =>
                  (e.currentTarget as HTMLInputElement).showPicker()
                } // add this
                placeholder="DD/MM/YYYY"
                required
                error={fieldErrors.dateOfBirth}
                suffix={
                  <Image
                    src="/assets/header/calendar.svg"
                    alt="calendar"
                    width={20}
                    height={20}
                    className="prts-float-field__calendar"
                    onClick={(e) => {
                      const input = e.currentTarget
                        .closest(".prts-float-field")
                        ?.querySelector("input");
                      input?.showPicker();
                    }}
                  />
                }
              />
              <button
                type="submit"
                className="prts-btn prts-btn--primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Submit"}
              </button>
            </>
          ) : (
            <>
              <PrtsFloatingSelect
                label="State Council"
                value={draft.stateCouncil}
                onChange={(v) => update("stateCouncil", v)}
                options={councilOptions}
                required
                error={fieldErrors.stateCouncil}
              />
              <PrtsFloatingField
                label="Full Name"
                value={draft.fullName}
                onChange={(v) => {
                  const onlyText = v.replace(/[^a-zA-Z\s]/g, ""); // allow only letters + space
                  update("fullName", onlyText);
                }}
                placeholder="Enter your full name"
                required
                error={fieldErrors.fullName}
              />
              <PrtsFloatingField
                label="Email Address"
                type="email"
                value={draft.email ?? ""}
                onChange={(v) => update("email", v)}
                placeholder="abc@gmail.com"
                required
                error={fieldErrors.email}
                disablePaste
              />
              <PrtsFloatingField
                label="Confirm Email Address"
                type="email"
                value={draft.confirmEmail ?? ""}
                onChange={(v) => update("confirmEmail", v)}
                placeholder="abc@gmail.com"
                required
                error={fieldErrors.confirmEmail}
                disablePaste
              />
              <PrtsFloatingPhone
                label="Mobile Number"
                value={draft.mobile ?? ""}
                onChange={(v) => update("mobile", v)}
                required
                error={fieldErrors.mobile}
                disablePaste
              />
              <PrtsFloatingPhone
                label="WhatsApp Number"
                value={draft.whatsapp ?? ""}
                onChange={(v) => update("whatsapp", v)}
                required
                error={fieldErrors.whatsapp}
                disablePaste
              />
              <fieldset className="prts-auth-radio-group">
                <div className="prts-auth-radio-row2">
                  <legend>Do you have BHS No.?:</legend>
                  <label
                    className={`prts-auth-radio-option yesbhs ${
                      hasBhsNo === "yes" ? "prts-auth-radio-option--active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasBhsNo"
                      checked={hasBhsNo === "yes"}
                      onChange={() => {
                        setHasBhsNo("yes");
                        setBhsNumber("");
                        setBhsNumberError("");
                      }}
                    />
                    Yes
                  </label>
                  <label
                    className={`prts-auth-radio-option ${
                      hasBhsNo === "no" ? "prts-auth-radio-option--active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasBhsNo"
                      checked={hasBhsNo === "no"}
                      onChange={() => {
                        setHasBhsNo("no");
                        setBhsNumber("");
                        setBhsNumberError("");
                      }}
                    />
                    No
                  </label>
                </div>
              </fieldset>
              {hasBhsNo === "yes" && (
                <PrtsFloatingField
                  label="BHS Number"
                  type="number"
                  value={bhsNumber}
                  onChange={(v) => {
                    setBhsNumber(v);
                    if (bhsNumberError) setBhsNumberError("");
                  }}
                  required
                  error={bhsNumberError}
                />
              )}
              <button
                type="submit"
                className="prts-btn prts-btn--primary prts-btn--wide"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Get verification code"}
              </button>
            </>
          )}
        </form>
      </article>
    </>
  );
}
