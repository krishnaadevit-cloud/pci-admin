"use client";

import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDashboardData,
  selectApplicationTypes,
  selectApplicationTypeByName,
  fetchApplicationTypesData,
  setApplicationUuid,
} from "@/store/slices";
import { postData } from "@/service/ApplicationService";
import { PHARMACY_ADD_OTHER_APPLICATION } from "@/config/ApiConstant";
import { loadUser } from "@/lib/auth/cookieStorage";
import type { NameForm } from "../constants";
import {
  hprAadhaarLink,
  hprAadhaarIsAuthenticated,
  hprAadhaarVerify,
} from "@/services/authService";

type KycStatus = "idle" | "linking" | "waiting" | "verifying" | "done" | "error";

const KYC_POLL_INTERVAL_MS = 3000;
const MAX_KYC_POLL_MS = 5 * 60 * 1000;

const TRUE_AUTH_VALUES = new Set([
  "1", "true", "yes", "y", "authenticated", "authsuccess", "authsuccessful",
  "complete", "completed", "verified", "success", "successful",
]);

const FALSE_AUTH_VALUES = new Set([
  "0", "false", "no", "n", "pending", "processing", "inprogress", "failed",
  "failure", "error", "expired", "cancelled", "canceled", "notauthenticated",
  "unauthenticated", "notverified", "incomplete",
]);

const AUTH_WRAPPER_KEYS = new Set([
  "data", "result", "payload", "response", "auth", "authentication", "aadhaarauth", "aadharauth",
]);

const EXPLICIT_AUTH_KEYS = new Set([
  "authenticated", "isauthenticated", "is_authenticated", "aadhaarauthenticated",
  "aadhaar_authenticated", "aadharauthenticated", "aadhar_authenticated",
  "isaadhaarauthenticated", "isaadharauthenticated", "verified", "isverified",
  "is_verified", "authenticationstatus", "authstatus", "kycstatus",
  "aadhaarstatus", "aadharstatus",
]);

const GENERIC_STATUS_KEYS = new Set(["status", "state"]);

function normalizeKey(key: string) {
  return key.replace(/[\s_-]/g, "").toLowerCase();
}

function readAuthValue(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  if (typeof value === "string") {
    const normalized = normalizeKey(value);
    if (TRUE_AUTH_VALUES.has(normalized)) return true;
    if (FALSE_AUTH_VALUES.has(normalized)) return false;
  }
  return null;
}

function extractAuthState(response: unknown, allowGenericStatus = false): boolean | null {
  const directValue = readAuthValue(response);
  if (directValue !== null) return directValue;
  if (!response || typeof response !== "object") return null;
  if (Array.isArray(response)) {
    for (const item of response) {
      const v = extractAuthState(item, allowGenericStatus);
      if (v !== null) return v;
    }
    return null;
  }
  const entries = Object.entries(response as Record<string, unknown>);
  for (const [key, value] of entries) {
    if (!AUTH_WRAPPER_KEYS.has(normalizeKey(key))) continue;
    const v = extractAuthState(value, true);
    if (v !== null) return v;
  }
  for (const [key, value] of entries) {
    const nk = normalizeKey(key);
    if (!EXPLICIT_AUTH_KEYS.has(nk)) continue;
    const v = readAuthValue(value) ?? extractAuthState(value, true);
    if (v !== null) return v;
  }
  if (!allowGenericStatus) return null;
  for (const [key, value] of entries) {
    if (!GENERIC_STATUS_KEYS.has(normalizeKey(key))) continue;
    const v = readAuthValue(value) ?? extractAuthState(value, true);
    if (v !== null) return v;
  }
  return null;
}

function getResponsePayload<T>(response: T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as { data?: unknown }).data !== undefined
  ) {
    return (response as { data: T }).data;
  }
  return response;
}

function isSameName(oldFullName: string, newFullName: string): boolean {
  return oldFullName.trim().toLowerCase() === newFullName.trim().toLowerCase();
}

interface ChangePersonalDetailsStepProps {
  onBack: () => void;
  onContinue: () => void;
  onNameConfirmed: (name: NameForm) => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

export default function ChangePersonalDetailsStep({
  onBack,
  onContinue,
  onNameConfirmed,
}: ChangePersonalDetailsStepProps) {
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const applicationTypes = useAppSelector(selectApplicationTypes);
  const changeNameApplicationType = useAppSelector(selectApplicationTypeByName("Change In Name"));
  const pd = (dashboardData?.fresh_app_details?.personalDetails ?? {}) as Record<string, any>;

  const toast = useRef<Toast>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState<NameForm | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    if (applicationTypes.length === 0) {
      dispatch(fetchApplicationTypesData());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  function stopPolling() {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }

  function closePopup() {
    const popup = popupRef.current;
    if (popup) {
      try {
        if (!popup.closed) popup.close();
      } catch {
        // cross-origin policy may block access
      }
    }
    popupRef.current = null;
  }

  async function completeKyc(txnId: string) {
    stopPolling();
    closePopup();
    setKycStatus("verifying");
    try {
      const verifyResult = await hprAadhaarVerify(txnId);
      const data = getResponsePayload(verifyResult) as Record<string, any>;
      const rawName: string = data.name ?? data.fullName ?? "";
      setNewName({ fullName: rawName.trim() });
      setKycStatus("done");
    } catch {
      setError("Failed to retrieve name details. Please try again.");
      setKycStatus("error");
    }
  }

  function handleCancel() {
    stopPolling();
    closePopup();
    setKycStatus("idle");
    setError(null);
  }

  async function initiateKyc() {
    setError(null);
    setKycStatus("linking");

    let txnId: string;
    let url: string;

    try {
      const linkResult = await hprAadhaarLink();
      const payload = getResponsePayload(linkResult) as Record<string, any>;
      url = payload.url;
      txnId = payload.txnId;
    } catch {
      setError("Failed to initiate Aadhaar KYC. Please try again.");
      setKycStatus("error");
      return;
    }

    const w = window.screen.availWidth;
    const h = window.screen.availHeight;
    const popup = window.open(url, "NHA_KYC", `width=${w},height=${h},top=0,left=0,scrollbars=yes,resizable=yes`);
    if (!popup) {
      setError("Popup was blocked. Please allow popups for this site and try again.");
      setKycStatus("error");
      return;
    }
    popupRef.current = popup;
    setKycStatus("waiting");

    let isPollRunning = false;
    const pollStartedAt = Date.now();

    pollingRef.current = setInterval(async () => {
      if (isPollRunning) return;
      isPollRunning = true;
      try {
        const authResult = await hprAadhaarIsAuthenticated(txnId);
        if (extractAuthState(authResult) === true) {
          await completeKyc(txnId);
          return;
        }
      } catch {
        // silently retry
      } finally {
        if (pollingRef.current && Date.now() - pollStartedAt > MAX_KYC_POLL_MS) {
          stopPolling();
          setError("Aadhaar verification timed out. Please try again.");
          setKycStatus("error");
        }
        isPollRunning = false;
      }
    }, KYC_POLL_INTERVAL_MS);
  }

  const handleContinue = async () => {
    if (!newName) return;

    const oldFullName = pd.fullName ?? "-";
    const newFullName = newName.fullName;

    const sameName = isSameName(oldFullName, newFullName);

    if (sameName) {
      toast.current?.show({
        severity: "warn",
        summary: "No Change Detected",
        detail: "The name fetched from Aadhaar is the same as your current registered name. Please use a different Aadhaar or contact support.",
        life: 6000,
      });
      return;
    }

    setIsSubmitting(true);
    const user = loadUser();

    const payload = {
      application_uuid: changeNameApplicationType?.uuid ?? "",
      fresh_application_uuid:
        dashboardData?.fresh_application_uuid ?? "",
      user_uuid: user?.id ?? "",
      name_change_details: {
        old_full_name: oldFullName,
        new_full_name: newFullName,
      },
    };

    try {
      const response = await postData(PHARMACY_ADD_OTHER_APPLICATION, payload);
      const savedUuid = response?.data?.uuid ?? response?.uuid;
      if (savedUuid) {
        dispatch(setApplicationUuid(savedUuid));
      }
      onNameConfirmed(newName);
      onContinue();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to save name details. Please try again.";
      toast.current?.show({
        severity: "error",
        summary: "Submission Failed",
        detail: message,
        life: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = kycStatus === "linking" || kycStatus === "verifying";
  const kycDone = kycStatus === "done";

  const buttonLabel =
    kycStatus === "linking" ? "Initiating..." :
    kycStatus === "verifying" ? "Retrieving details..." :
    "E-KYC Verification";

  return (
    <div className="prts-personal-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      <div className="prts-personal-form-card">
        <div style={{ borderBottom: "1px solid #E5E5E5" }} className="prts-step-content pb-6">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title m-0">Change Personal Details</h1>
          </div>
        </div>

        {/* Current name — shown until KYC is done */}
        {!kycDone && (
          <>
            <div className="prts-info-box mt-6">
              <span>
                To update your name, complete E-KYC verification using your Aadhaar.
                Your current name is shown below for reference.
              </span>
            </div>

            <div className="prts-personal-accordion-group m-0 mt-6">
              <div className="prts-address-fields">
                <div className="prts-form-grid prts-form-grid--3">
                  <div className="prts-field prts-field--full">
                    <label className="prts-field__label">
                      Full Name<span className="prts-field__required">*</span>
                    </label>
                    <div className="prts-field__wrapper">
                      <input
                        className="prts-field__input"
                        value={pd.fullName ?? pd.full_name  ?? ""}
                        disabled
                        readOnly
                        onChange={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {kycStatus === "waiting" && (
              <div className="prts-info-box prts-ekyc-status-box mt-3">
                <span className="prts-ekyc-status-box__text">
                  Aadhaar verification is open in a new window. Complete the process there —
                  this page will update automatically once done.
                </span>
              </div>
            )}

            {kycStatus === "verifying" && (
              <div className="prts-info-box prts-ekyc-status-box mt-3">
                <span className="prts-ekyc-status-box__text">
                  Aadhaar verified. Retrieving your name details…
                </span>
              </div>
            )}

            {error && (
              <div className="prts-ekyc-error-box mt-3">
                <span>{error}</span>
              </div>
            )}
          </>
        )}

        {/* New name form — shown after KYC */}
        {kycDone && newName && (
          <div className="prts-personal-accordion-group m-0 mt-6">
            <div className="prts-address-fields">
              <div className="prts-form-grid prts-form-grid--3">
                <div className="prts-field prts-field--full">
                  <label className="prts-field__label">
                    Full Name<span className="prts-field__required">*</span>
                  </label>
                  <div className="prts-field__wrapper">
                    <input
                      className="prts-field__input"
                      value={newName.fullName}
                      disabled
                      readOnly
                      onChange={() => {}}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="prts-form-footer__actions mt-6">
          <button
            type="button"
            className="prts-btn prts-btn--outline"
            onClick={onBack}
            disabled={isLoading || isSubmitting}
          >
            Back
          </button>

          {!kycDone && (
            kycStatus === "waiting" ? (
              <button
                type="button"
                className="prts-btn prts-btn--outline"
                onClick={handleCancel}
              >
                Cancel Verification
              </button>
            ) : (
              <button
                type="button"
                className={`prts-btn prts-btn--primary${isLoading ? " prts-btn--disabled" : ""}`}
                disabled={isLoading}
                onClick={initiateKyc}
              >
                {buttonLabel}
              </button>
            )
          )}

          {kycDone && (
            <button
              type="button"
              className={`prts-btn prts-btn--primary${isSubmitting ? " prts-btn--disabled" : ""}`}
              disabled={isSubmitting}
              onClick={handleContinue}
            >
              {isSubmitting ? "Submitting..." : "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
