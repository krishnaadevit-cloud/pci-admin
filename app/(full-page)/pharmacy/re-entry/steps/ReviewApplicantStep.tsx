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

interface ReviewApplicantStepProps {
  onBack: () => void;
  onContinue: () => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

export default function ReviewApplicantStep({ onBack, onContinue }: ReviewApplicantStepProps) {
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (!dashboardData) {
      dispatch(fetchDashboardData()).unwrap().catch((err: unknown) => {
        const message = (err as { message?: string })?.message ?? "Failed to load applicant details. Please try again.";
        toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
      });
    }
  }, []);

  const pd = dashboardData?.fresh_app_details?.personalDetails;
  const cd = dashboardData?.fresh_app_details?.communicationDetails;

  const fullName =
    (pd?.fullName ?? pd?.full_name ??
    [pd?.surname, pd?.firstName, pd?.middleName].filter(Boolean).join(" ")) || "—";
  const registrationNo =
    dashboardData?.registration_no ?? pd?.registrationNo ?? "—";
  const mobile = pd?.mobileNo ? `+91 ${pd.mobileNo}` : "—";
  const email = pd?.email || "—";
  const address =
    [
      cd?.permanent_address,
      cd?.permanent_city,
      cd?.permanent_state,
      cd?.permanent_pin_code ? `- ${cd.permanent_pin_code}` : "",
    ]
      .filter(Boolean)
      .join(", ") || "—";

  return (
    <div className="prts-personal-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-personal-form-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title m-0">Review Applicant Details</h1>
          </div>
        </div>

        <div className="prts-application-preview prts-application-preview--inline mt-4">
          <div className="prts-preview-grid prts-preview-grid--4">
            <PreviewField label="Full Name" value={fullName} />
            <PreviewField label="Registration No." value={registrationNo} />
            <PreviewField label="Mobile" value={mobile} />
          </div>
          <div className="prts-preview-grid prts-preview-grid--2">
            <PreviewField label="Email Address" value={email} />
            <PreviewField label="Address" value={address} />
          </div>
        </div>

        <div className="prts-form-footer__actions mt-3">
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
