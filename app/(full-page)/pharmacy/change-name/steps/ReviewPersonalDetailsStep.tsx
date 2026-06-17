"use client";

import { useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardData, selectDashboardData } from "@/store/slices";

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="prts-preview-field">
      <span className="prts-preview-field__label">{label}</span>
      <span className="prts-preview-field__value">{value || "—"}</span>
    </div>
  );
}

interface ReviewPersonalDetailsStepProps {
  onBack: () => void;
  onContinue: () => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

export default function ReviewPersonalDetailsStep({
  onBack,
  onContinue,
}: ReviewPersonalDetailsStepProps) {
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (!dashboardData) {
      dispatch(fetchDashboardData()).unwrap().catch((err: unknown) => {
        const message = (err as { message?: string })?.message ?? "Failed to load your details. Please try again.";
        toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
      });
    }
  }, []);

  const pd = dashboardData?.fresh_app_details?.personalDetails as Record<string, any> | undefined;

  const fullName =
    (pd?.fullName ?? pd?.full_name .filter(Boolean).join(" ")) || "—";

  return (
    <div className="prts-personal-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-personal-form-card">
        <div style={{ borderBottom: "1px solid #E5E5E5" }} className="prts-step-content pb-6">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title m-0">Review Personal Details</h1>
          </div>
        </div>

        <div className="prts-application-preview prts-application-preview--inline mt-6">
          <div className="prts-preview-grid prts-preview-grid--1">
            <PreviewField label="Full Name" value={fullName} />
          </div>
        </div>

        <div className="prts-form-footer__actions mt-6">
          <button
            type="button"
            className="prts-btn prts-btn--outline"
            onClick={onBack}
          >
            Cancel
          </button>
          <button
            type="button"
            className="prts-btn prts-btn--primary"
            onClick={onContinue}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
