"use client";

import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updatePersonal, setApplicationId, selectPersonal, updateCommunicationAddress, selectDashboardData } from "@/store/slices";
import Image from "next/image";
import { hprAadhaarLink, hprAadhaarIsAuthenticated, hprAadhaarVerify, saveFreshApplication } from "@/services/authService";
import { loadUser } from "@/lib/auth/cookieStorage";

interface EkycStepProps {
  onComplete: () => void;
}

type KycStatus = "idle" | "linking" | "waiting" | "verifying" | "error";

const KYC_POLL_INTERVAL_MS = 3000;
const MAX_KYC_POLL_MS = 5 * 60 * 1000;

const TRUE_AUTH_VALUES = new Set([
  "1",
  "true",
  "yes",
  "y",
  "authenticated",
  "authsuccess",
  "authsuccessful",
  "complete",
  "completed",
  "verified",
  "success",
  "successful",
]);

const FALSE_AUTH_VALUES = new Set([
  "0",
  "false",
  "no",
  "n",
  "pending",
  "processing",
  "inprogress",
  "failed",
  "failure",
  "error",
  "expired",
  "cancelled",
  "canceled",
  "notauthenticated",
  "unauthenticated",
  "notverified",
  "incomplete",
]);

const AUTH_WRAPPER_KEYS = new Set([
  "data",
  "result",
  "payload",
  "response",
  "auth",
  "authentication",
  "aadhaarauth",
  "aadharauth",
]);

const EXPLICIT_AUTH_KEYS = new Set([
  "authenticated",
  "isauthenticated",
  "is_authenticated",
  "aadhaarauthenticated",
  "aadhaar_authenticated",
  "aadharauthenticated",
  "aadhar_authenticated",
  "isaadhaarauthenticated",
  "isaadharauthenticated",
  "verified",
  "isverified",
  "is_verified",
  "authenticationstatus",
  "authstatus",
  "kycstatus",
  "aadhaarstatus",
  "aadharstatus",
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

function extractAuthState(
  response: unknown,
  allowGenericStatus = false,
): boolean | null {
  const directValue = readAuthValue(response);
  if (directValue !== null) return directValue;

  if (!response || typeof response !== "object") return null;

  if (Array.isArray(response)) {
    for (const item of response) {
      const itemValue = extractAuthState(item, allowGenericStatus);
      if (itemValue !== null) return itemValue;
    }
    return null;
  }

  const entries = Object.entries(response as Record<string, unknown>);

  for (const [key, value] of entries) {
    if (!AUTH_WRAPPER_KEYS.has(normalizeKey(key))) continue;

    const wrappedValue = extractAuthState(value, true);
    if (wrappedValue !== null) return wrappedValue;
  }

  for (const [key, value] of entries) {
    const normalizedKey = normalizeKey(key);
    if (!EXPLICIT_AUTH_KEYS.has(normalizedKey)) continue;

    const fieldValue = readAuthValue(value);
    if (fieldValue !== null) return fieldValue;

    const nestedValue = extractAuthState(value, true);
    if (nestedValue !== null) return nestedValue;
  }

  if (!allowGenericStatus) return null;

  for (const [key, value] of entries) {
    if (!GENERIC_STATUS_KEYS.has(normalizeKey(key))) continue;

    const fieldValue = readAuthValue(value);
    if (fieldValue !== null) return fieldValue;

    const nestedValue = extractAuthState(value, true);
    if (nestedValue !== null) return nestedValue;
  }

  return null;
}

function toYYYYMMDD(raw: string | null | undefined): string {
  if (!raw) return "";
  const s = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().split("T")[0];
  return s;
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

export default function EkycStep({ onComplete }: EkycStepProps) {
  const dispatch = useAppDispatch();
  const personal = useAppSelector(selectPersonal);
  const alreadyVerified = personal.aadhaarVerified;
  const dashboardData = useAppSelector(selectDashboardData);

  const [screen, setScreen] = useState<1 | 2>(alreadyVerified ? 2 : 1);

  const [kycStatus, setKycStatus] = useState<KycStatus>("idle");
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [confirmLoading, setConfirmLoading] = useState(false);
  const toast = useRef<Toast>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!alreadyVerified) return;
    if (screen === 1) setScreen(2);
    if (!verifiedData) {
      const rawResponse = dashboardData?.fresh_app_details?.aadhaarResponse;
      console.log(dashboardData, 'rawResponserawResponse')
      if (rawResponse) {
        try {
          setVerifiedData(typeof rawResponse === "string" ? JSON.parse(rawResponse) : rawResponse);
        } catch {
          // leave verifiedData null — "already verified" fallback card will show
        }
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alreadyVerified, dashboardData]);

  console.log(verifiedData, 'verifiedDataverifiedData')
  console.log(alreadyVerified, 'alreadyVerifiedalreadyVerified')
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
        // The ABDM window can sever its opener via cross-origin policies.
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
      const data = getResponsePayload(verifyResult);
      setVerifiedData(data);
      setScreen(2);
      setKycStatus("idle");
    } catch {
      setError("Failed to retrieve verified details. Please try again.");
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
      const payload = getResponsePayload(linkResult);
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
        const isAuthenticated = extractAuthState(authResult);

        if (isAuthenticated === true) {
          await completeKyc(txnId);
          return;
        }
      } catch {
        // Ignore API errors — keep retrying silently
      } finally {
        if (
          pollingRef.current &&
          Date.now() - pollStartedAt > MAX_KYC_POLL_MS
        ) {
          stopPolling();
          setError(
            "We couldn't confirm Aadhaar verification yet. Please try again.",
          );
          setKycStatus("error");
        }

        isPollRunning = false;
      }
    }, KYC_POLL_INTERVAL_MS);
  }

  const isLoading = kycStatus === "linking" || kycStatus === "verifying";

  const buttonLabel =
    kycStatus === "linking" ? "Initiating..." :
      kycStatus === "verifying" ? "Retrieving details..." :
        "E-KYC Verification";

  return (
    <div className="prts-ekyc-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      {screen === 1 && (
        <div className="prts-ekyc-card">
          <div className="prts-step-content">
            <div className="prts-step-content__header">
              <h1 className="prts-step-content__title">E-KYC Verification</h1>
              <p className="prts-step-content__desc">
                Before we begin, please verify your identity using Aadhaar OTP or
                DigiLocker. This ensures your application is securely linked to
                your official identity records.
              </p>
            </div>

            {kycStatus === "waiting" && (
              <div className="prts-info-box prts-ekyc-status-box">
                <span className="prts-ekyc-status-box__text">
                  Aadhaar verification is open in a new window. Complete the process
                  there — this page will update automatically once done.
                </span>
              </div>
            )}

            {kycStatus === "verifying" && (
              <div className="prts-info-box prts-ekyc-status-box">
                <span className="prts-ekyc-status-box__text">
                  Aadhaar verified successfully. Retrieving your details…
                </span>
              </div>
            )}

            {dashboardData != null && (
              <>
                {error && (
                  <div className="prts-ekyc-error-box">
                    <span>{error}</span>
                  </div>
                )}

                <div className="prts-step-content__actions prts-step-content__actions--left">
                  {kycStatus === "waiting" ? (
                    <button
                      type="button"
                      className="prts-btn prts-btn--outline"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="prts-btn prts-btn--primary"
                      onClick={initiateKyc}
                      disabled={isLoading}
                    >
                      {buttonLabel}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {screen === 2 && !verifiedData && alreadyVerified && (
        <div className="prts-ekyc-footer">
          <div className="prts-aadhaar-success-card" style={{ marginBottom: "1.5rem" }}>
            <div className="prts-aadhaar-success-card__header">
              <div className="prts-aadhaar-success-card__status">
                <Image
                  src="/assets/fresh-registration/aadhar-success.svg"
                  alt="Aadhaar Icon"
                  width={45}
                  height={45}
                />
                <h2 className="prts-aadhaar-success-card__title">
                  Aadhaar Verified {<br />} Successfully
                </h2>
              </div>
              <div className="prts-aadhaar-success-card__logos">
                <Image
                  src="/assets/fresh-registration/goiWithAadhar.svg"
                  alt="Government of India"
                  width={132}
                  height={50}
                />
              </div>
            </div>
          </div>
          <div className="prts-step-content__actions prts-step-content__actions--spread">
            <div />
            <button
              type="button"
              className="prts-btn prts-btn--primary prts-btn--pill"
              onClick={onComplete}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {screen === 2 && verifiedData && (
        <>
          <div className="prts-ekyc-success">
            <div className="prts-aadhaar-success-card">
              <div className="prts-aadhaar-success-card__header">
                <div className="prts-aadhaar-success-card__status">
                  <Image
                    src="/assets/fresh-registration/aadhar-success.svg"
                    alt="Aadhaar Icon"
                    width={45}
                    height={45}
                  />
                  <h2 className="prts-aadhaar-success-card__title">
                    Aadhaar Verified {<br />} Successfully
                  </h2>
                </div>
                <div className="prts-aadhaar-success-card__logos">
                  <Image
                    src="/assets/fresh-registration/goiWithAadhar.svg"
                    alt="Government of India"
                    width={132}
                    height={50}
                  />
                </div>
              </div>
              <div className="prts-aadhaar-success-card__body">
                {/* {verifiedData.photo && (
                  <div className="prts-aadhaar-success-card__field prts-aadhaar-success-card__field--full prts-aadhaar-success-card__field--photo">
                    <img
                      src={`data:image/jpeg;base64,${verifiedData.photo}`}
                      alt="Aadhaar Photo"
                      className="prts-aadhaar-success-card__photo"
                    />
                  </div>
                )} */}
                <div className="prts-aadhaar-success-card__row prts-aadhaar-success-card__row--3">
                  <div className="prts-aadhaar-success-card__field">
                    <span className="prts-aadhaar-success-card__label">Full Name</span>
                    <span className="prts-aadhaar-success-card__value">
                      {verifiedData.name ?? verifiedData.fullName ?? "—"}
                    </span>
                  </div>
                  <div className="prts-aadhaar-success-card__field">
                    <span className="prts-aadhaar-success-card__label">Date of Birth</span>
                    <span className="prts-aadhaar-success-card__value">
                      {verifiedData.birthdate ?? verifiedData.dateOfBirth ?? verifiedData.dob ?? "—"}
                    </span>
                  </div>
                  <div className="prts-aadhaar-success-card__field">
                    <span className="prts-aadhaar-success-card__label">Gender</span>
                    <span className="prts-aadhaar-success-card__value">
                      {verifiedData.gender === "M" ? "Male" : verifiedData.gender === "F" ? "Female" : verifiedData.gender ?? "—"}
                    </span>
                  </div>
                </div>
                {verifiedData.careOf && (
                  <div className="prts-aadhaar-success-card__field prts-aadhaar-success-card__field--full">
                    <span className="prts-aadhaar-success-card__label">Care Of</span>
                    <span className="prts-aadhaar-success-card__value">
                      {verifiedData.careOf}
                    </span>
                  </div>
                )}
                <div className="prts-aadhaar-success-card__row prts-aadhaar-success-card__row--3">
                  {verifiedData.district && (
                    <div className="prts-aadhaar-success-card__field">
                      <span className="prts-aadhaar-success-card__label">District</span>
                      <span className="prts-aadhaar-success-card__value">
                        {verifiedData.district}
                      </span>
                    </div>
                  )}
                  {verifiedData.state && (
                    <div className="prts-aadhaar-success-card__field">
                      <span className="prts-aadhaar-success-card__label">State</span>
                      <span className="prts-aadhaar-success-card__value">
                        {verifiedData.state}
                      </span>
                    </div>
                  )}
                  {verifiedData.pincode && (
                    <div className="prts-aadhaar-success-card__field">
                      <span className="prts-aadhaar-success-card__label">Pincode</span>
                      <span className="prts-aadhaar-success-card__value">
                        {verifiedData.pincode}
                      </span>
                    </div>
                  )}
                </div>
                <div className="prts-aadhaar-success-card__field prts-aadhaar-success-card__field--full">
                  <span className="prts-aadhaar-success-card__label">Address</span>
                  <span className="prts-aadhaar-success-card__value">
                    {[
                      verifiedData.house,
                      verifiedData.street,
                      verifiedData.landmark,
                      verifiedData.locality,
                      verifiedData.villageTownCity,
                      verifiedData.subDist,
                      verifiedData.district,
                      verifiedData.state,
                      verifiedData.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ") || verifiedData.address || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="prts-ekyc-footer">
            <div className="prts-step-content__actions prts-step-content__actions--spread">
              <button
                type="button"
                className="prts-btn prts-btn--outline"
                onClick={() => {
                  setScreen(1);
                  setVerifiedData(null);
                  setKycStatus("idle");
                  setError(null);
                }}
              >
                Back
              </button>
              {!alreadyVerified ? (<button
                type="button"
                className="prts-btn prts-btn--primary prts-btn--pill"
                disabled={confirmLoading}
                onClick={async () => {
                  const authUser = loadUser();

                  // Aadhaar name format: "SURNAME FIRSTNAME MIDDLENAME"
                  const rawName: string = verifiedData.name ?? verifiedData.fullName ?? "";
                  const nameParts = rawName.trim().split(/\s+/);
                  const surname = nameParts[0] ?? "";
                  const firstName = nameParts.length > 1 ? nameParts[1] : "";
                  const middleName = nameParts.length > 2 ? nameParts.slice(2).join(" ") : "";

                  const rawGender: string = verifiedData.gender ?? "";
                  const gender = rawGender === "M" ? "MALE" : rawGender === "F" ? "FEMALE" : rawGender.toUpperCase();
                  const birth_date = toYYYYMMDD(verifiedData.birthdate ?? verifiedData.dateOfBirth ?? verifiedData.dob);

                  const addressParts = [
                    verifiedData.house,
                    verifiedData.street,
                    verifiedData.landmark,
                    verifiedData.locality,
                    verifiedData.villageTownCity,
                    verifiedData.subDist,
                  ].filter(Boolean);
                  const addressString = addressParts.join(", ") || verifiedData.address || "";

                  setConfirmLoading(true);
                  try {
                    const response = await saveFreshApplication({
                      user_uuid: authUser?.id ?? "",
                      personal_details: {
                        full_name: rawName.trim(),
                        gender,
                        birth_date,
                        mobile_no: authUser?.mobile ?? "",
                        email: authUser?.email ?? verifiedData.email ?? "",
                        aadhaar_verified: true,
                        aadhaar_response: JSON.stringify(verifiedData),
                        profile_picture: verifiedData.photo ?? "",
                      },
                      communication_details: {
                        permanent_address: addressString,
                        permanent_pin_code: verifiedData.pincode ?? "",
                      },
                    });

                    const applicationId: string | undefined =
                      response?.data?.fresh_application_uuid ??
                      response?.data?.personalDetails?.uuid ??
                      response?.personalDetails?.uuid
                    if (applicationId) dispatch(setApplicationId(applicationId));

                    dispatch(updateCommunicationAddress({
                      key: "permanent",
                      patch: {
                        address: addressString,
                        pinCode: verifiedData.pincode ?? "",
                        state: verifiedData.state ?? "",
                        district: verifiedData.district ?? "",
                        city: verifiedData.villageTownCity ?? verifiedData.subDist ?? "",
                      },
                    }));

                    dispatch(updatePersonal({
                      fullName: rawName.trim(),
                      firstName,
                      middleName,
                      surname,
                      gender,
                      dob: birth_date,
                      aadhaarVerified: true,
                      ...(authUser?.mobile ? { mobile: authUser.mobile } : {}),
                      ...(authUser?.email ? { email: authUser.email } : verifiedData.email ? { email: verifiedData.email } : {}),
                    }));

                    onComplete();
                  } catch (err: any) {
                    const message =
                      err?.response?.data?.message ?? err?.message ?? "Failed to save. Please try again.";
                    toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
                  } finally {
                    setConfirmLoading(false);
                  }
                }}
              >
                {confirmLoading ? "Saving..." : "Confirm and Continue"}
              </button>) : (
                <button
                  type="button"
                  className="prts-btn prts-btn--primary prts-btn--pill"
                  onClick={onComplete}
                >
                  Continue
                </button>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}