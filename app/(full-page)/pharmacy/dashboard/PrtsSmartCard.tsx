"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSmartCardData, selectSmartCardData, selectSmartCardLoading } from "@/store/slices";
import { downloadSmartCard } from "@/services/smartCardDownloadService";

function formatDate(raw: string | undefined | null): string {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="prts-smart-card__field">
      <span className="prts-smart-card__field-label">{label}</span>
      <span className="prts-smart-card__field-value">{value}</span>
    </div>
  );
}

function SkeletonField() {
  return (
    <div className="prts-smart-card__field">
      <div className="prts-skeleton prts-skeleton--text" style={{ height: 11, width: "50%", marginBottom: 6 }} />
      <div className="prts-skeleton prts-skeleton--text" style={{ height: 14, width: "75%" }} />
    </div>
  );
}

export default function PrtsSmartCard() {
  const dispatch    = useAppDispatch();
  const { user }    = useAuth();
  const cardData    = useAppSelector(selectSmartCardData);
  const isLoading   = useAppSelector(selectSmartCardLoading);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    dispatch(fetchSmartCardData());
  }, [dispatch]);

  async function handleDownload() {
    const fileNo = cardData?.fileNo ?? cardData?.file_no ?? "";
    if (!fileNo) return;
    try {
      setDownloading(true);
      const res = await downloadSmartCard(fileNo);
      // Handle URL response — covers { downloadUrl }, { url }, { data: { downloadUrl } }
      const url =
        res?.downloadUrl ??
        res?.url         ??
        res?.data?.downloadUrl ??
        res?.data?.url   ??
        (typeof res === "string" ? res : null);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setDownloading(false);
    }
  }

  const displayName = user?.fullName ?? "User";

  // Defensive field access — covers flat and nested response shapes
  const fullName =
    cardData?.fullName ??
    displayName;

  const phone =
    cardData?.mobile       ? `+91 ${cardData.mobile}`      :
    cardData?.mobileNo     ? `+91 ${cardData.mobileNo}`    :
    cardData?.mobile_no    ? `+91 ${cardData.mobile_no}`   :
    user?.mobile           ? `+91 ${user.mobile}`          : "—";

  const email =
    cardData?.email ?? user?.email ?? "—";

  const addressParts = [
    cardData?.address ?? cardData?.permanentAddress ?? cardData?.permanent_address,
    cardData?.city    ?? cardData?.permanentCity    ?? cardData?.permanent_city,
    cardData?.state   ?? cardData?.permanentState   ?? cardData?.permanent_state,
    (cardData?.pincode ?? cardData?.pinCode ?? cardData?.permanent_pin_code)
      ? `- ${cardData?.pincode ?? cardData?.pinCode ?? cardData?.permanent_pin_code}`
      : null,
  ].filter(Boolean);
  const address = addressParts.length ? addressParts.join(", ") : "—";

  const regNo            = cardData?.regNo            ?? cardData?.registrationNo    ?? cardData?.registration_no    ?? "—";
  const validUpto        = formatDate(cardData?.validityDate  ?? cardData?.validity_date  ?? cardData?.validUpto);
  const fileNo           = cardData?.fileNo           ?? cardData?.file_no           ?? "—";
  const registrationDate = formatDate(cardData?.registrationDate ?? cardData?.registration_date);

  return (
    <div className="prts-smart-card-page">
      <div className="prts-recent-activity">
        <div className="prts-recent-activity__top">
          <h2 className="prts-recent-activity__page-title">Smart Card</h2>
        </div>
      </div>

      <div className="prts-smart-card">
        {/* AVATAR */}
        <div className="prts-smart-card__avatar-wrap">
          <div className="prts-smart-card__avatar-circle">
            <Image
              src={cardData?.profileImageUrl || "/assets/header/userphoto.svg"}
              alt="profile"
              width={72}
              height={72}
              className="prts-user-avatar__image"
            />
          </div>
        </div>

        {/* PERSONAL DETAILS GRID */}
        <div className="prts-smart-card__personal-grid">
          {isLoading ? (
            <>
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <div className="prts-smart-card__field prts-smart-card__field--full">
                <div className="prts-skeleton prts-skeleton--text" style={{ height: 11, width: "30%", marginBottom: 6 }} />
                <div className="prts-skeleton prts-skeleton--text" style={{ height: 14, width: "90%" }} />
              </div>
            </>
          ) : (
            <>
              <InfoField label="Full Name"     value={fullName} />
              <InfoField label="Phone"         value={phone}    />
              <InfoField label="Email Address" value={email}    />
              <div className="prts-smart-card__field prts-smart-card__field--full">
                <span className="prts-smart-card__field-label">Address</span>
                <span className="prts-smart-card__field-value">{address}</span>
              </div>
            </>
          )}
        </div>

        {/* DIVIDER */}
        <div className="prts-smart-card__divider" />

        {/* REGISTRATION DETAILS GRID */}
        <div className="prts-smart-card__reg-grid">
          {isLoading ? (
            <>
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
              <SkeletonField />
            </>
          ) : (
            <>
              <InfoField label="Pharmacist Registration No." value={regNo}            />
              <InfoField label="Valid Up to"                 value={validUpto}        />
              <InfoField label="File No."                    value={fileNo}           />
              <InfoField label="Registration Date"           value={registrationDate} />
            </>
          )}
        </div>

        {/* DIVIDER */}
        <div className="prts-smart-card__divider" />

        {/* DOWNLOAD BUTTON */}
        <button
          type="button"
          className="prts-smart-card__download-btn"
          onClick={handleDownload}
          disabled={downloading || isLoading}
        >
          <span className="prts-smart-card__download-icon" aria-hidden>
            {downloading ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ animation: "prts-spin 0.9s linear infinite" }}
              >
                <path d="M12 2a10 10 0 1 0 10 10" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
          </span>
          <span className="prts-smart-card__download-label">
            {downloading ? "Downloading…" : "Download Card"}
          </span>
        </button>
      </div>
    </div>
  );
}
