"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getAllDetails } from "@/service/Payment_Service";
import { VERIFY_ORDER } from "@/config/ApiConstant";
import "@/styles/layout/prts/prts-thankYou.scss";

type PaymentStatus =
  | "SUCCESS"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "PENDING"
  | "ACTIVE"
  | string;

interface FeesSummary {
  fee_code?: string;
  subtotal?: number;
  gst?: number;
  gst_percent?: number;
  total?: number;
  currency?: string;
}

interface VerifyOrderResponse {
  order_id?: string;
  cf_order_id?: string;
  status?: PaymentStatus;
  payment_session_id?: string;
  application_name?: string;
  application_uuid?: string;
  amount_paid?: number;
  currency?: string;
  transaction_id?: string;
  payment_mode?: string;
  paid_at?: string;
  fee_summary?: FeesSummary;
  [key: string]: unknown;
}

function formatAmount(amount?: number, currency = "INR"): string {
  if (amount == null) return "—";
  return `₹ ${amount.toLocaleString("en-IN")}`;
}

function formatDateTime(raw?: string): string {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return raw;
  }
}

function isSuccess(status?: PaymentStatus): boolean {
  return status === "SUCCESS" || status === "PAID";
}

function isFailed(status?: PaymentStatus): boolean {
  return status === "FAILED" || status === "CANCELLED";
}

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId =
    searchParams.get("order_id") ?? searchParams.get("orderId") ?? "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<VerifyOrderResponse | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError("Order ID not found. Please contact support.");
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await getAllDetails(
          `${VERIFY_ORDER}/${encodeURIComponent(orderId)}`,
        );
        setData(response);
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message ??
          (err as Error)?.message ??
          "Failed to verify payment. Please contact support.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [orderId]);

  const status = data?.status;
  const success = isSuccess(status);
  const failed = isFailed(status);

  if (loading) {
    return (
      <div className="prts-payment-success-container">
        <div
          className="prts-payment-success-content"
          style={{ textAlign: "center" }}
        >
          <i
            className="pi pi-spin pi-spinner"
            style={{ fontSize: "2.5rem", color: "#4a3aff" }}
          />
          <p style={{ marginTop: "1rem", color: "#727272" }}>
            Verifying your payment…
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="prts-payment-success-container">
        <div
          className="prts-payment-success-content"
          style={{ textAlign: "center" }}
        >
          <i
            className="pi pi-times-circle"
            style={{ fontSize: "3rem", color: "#d32f2f" }}
          />
          <h1
            className="prts-payment-success-title"
            style={{ marginTop: "1rem" }}
          >
            Verification Failed
          </h1>
          <p style={{ color: "#727272", marginBottom: "1.5rem" }}>{error}</p>
          <button
            className="prts-payment-button prts-payment-button--primary"
            onClick={() => router.push("/pharmacy/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prts-payment-success-container">
      <div className="prts-payment-success-content">
        {/* Icon */}
        <div className="prts-payment-success-icon">
          {success ? (
            <Image
              src="/assets/payment/success.svg"
              alt="Payment Success"
              width={80}
              height={80}
              priority
            />
          ) : failed ? (
            <i
              className="pi pi-times-circle"
              style={{ fontSize: "4rem", color: "#d32f2f" }}
            />
          ) : (
            <i
              className="pi pi-clock"
              style={{ fontSize: "4rem", color: "#f59e0b" }}
            />
          )}
        </div>

        {/* Title */}
        <h1 className="prts-payment-success-title">
          {success
            ? "Payment Successful!"
            : failed
            ? "Payment Failed"
            : "Payment Pending"}
        </h1>

        {/* Description */}
        <p className="prts-payment-success-description">
          {success
            ? "Your registration fee has been received. Your application for Fresh Registration is now under review."
            : failed
            ? "Your payment could not be processed. Please try again or contact support."
            : "Your payment is being processed. Please check back shortly."}
        </p>

        {/* Details */}
        <div className="prts-payment-details-section">
          {data?.order_id && (
            <div className="prts-payment-detail-row">
              <span className="prts-payment-detail-label">Order ID</span>
              <span className="prts-payment-detail-value">{data.order_id}</span>
            </div>
          )}

          {data?.cf_order_id && (
            <div className="prts-payment-detail-row">
              <span className="prts-payment-detail-label">Transaction ID</span>
              <span className="prts-payment-detail-value">
                {data.cf_order_id}
              </span>
            </div>
          )}

          {data?.transaction_id && (
            <div className="prts-payment-detail-row">
              <span className="prts-payment-detail-label">Transaction ID</span>
              <span className="prts-payment-detail-value">
                {data.transaction_id}
              </span>
            </div>
          )}

          {data?.application_name && (
            <div className="prts-payment-detail-row">
              <span className="prts-payment-detail-label">Application</span>
              <span className="prts-payment-detail-value">
                {data.application_name}
              </span>
            </div>
          )}

          {data?.payment_mode && (
            <div className="prts-payment-detail-row">
              <span className="prts-payment-detail-label">Payment Mode</span>
              <span className="prts-payment-detail-value">
                {data.payment_mode}
              </span>
            </div>
          )}

          <div className="prts-payment-detail-row">
            <span className="prts-payment-detail-label">Amount</span>
            <span
              className={`prts-payment-detail-value${
                success ? " prts-payment-detail-value--amount" : ""
              }`}
            >
              {formatAmount(data?.fee_summary?.total ?? data?.amount_paid)}
            </span>
          </div>

          {data?.paid_at && (
            <div className="prts-payment-detail-row">
              <span className="prts-payment-detail-label">Date & Time</span>
              <span className="prts-payment-detail-value">
                {formatDateTime(data.paid_at)}
              </span>
            </div>
          )}

          <div className="prts-payment-detail-row">
            <span className="prts-payment-detail-label">Status</span>
            <span
              className={`prts-payment-detail-value${
                success ? " prts-payment-detail-value--success" : ""
              }`}
              style={
                failed
                  ? { color: "#d32f2f" }
                  : !success
                  ? { color: "#f59e0b" }
                  : undefined
              }
            >
              {success && (
                <Image
                  src="/assets/payment/rightok.svg"
                  alt="Success"
                  width={20}
                  height={20}
                  priority
                />
              )}
              {status ?? "—"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="prts-payment-buttons-group">
          <button
            className="prts-payment-button prts-payment-button--primary"
            onClick={() => router.push("/pharmacy/dashboard")}
          >
            Continue to Dashboard
          </button>
          {/* {success && (
            <button
              className="prts-payment-button prts-payment-button--secondary"
              onClick={() => window.print()}
            >
              <i className="pi pi-download" />
              Download Receipt
            </button>
          )} */}
          {/* {failed && (
            <button
              className="prts-payment-button prts-payment-button--secondary"
              onClick={() => router.push("/pharmacy/fresh-registration")}
            >
              Try Again
            </button>
          )} */}
        </div>

        {/* Footer */}
        <div className="prts-payment-footer">
          <p className="prts-payment-footer-text">
            If you need assistance with your application or have any inquiries,
            please don&apos;t hesitate to reach out to us at
          </p>
          <p className="prts-payment-footer-text">
            <a
              href="mailto:support@pcigov.in"
              className="prts-payment-contact-link"
            >
              support@pcigov.in
            </a>{" "}
            or{" "}
            <a href="tel:08002229-3051" className="prts-payment-contact-link">
              call 080-2229-3051
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
