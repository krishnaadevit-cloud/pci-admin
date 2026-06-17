"use client";

import { useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchDashboardData, selectDashboardData } from "@/store/slices";
import PrtsRegistrationAccordionSection from "@/app/(full-page)/pharmacy/fresh-registration/forms/PrtsRegistrationAccordionSection";

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

export default function ReviewPersonalDetailsStep({ onBack, onContinue }: ReviewPersonalDetailsStepProps) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pd = dashboardData?.fresh_app_details?.personalDetails;
  const cd = dashboardData?.fresh_app_details?.communicationDetails;

  const fullName =pd?.fullName ??  "—";
  const permanentAddress =
    [
      cd?.permanent_address,
      cd?.permanent_city,
      cd?.permanent_state,
      cd?.permanent_pin_code ? `- ${cd.permanent_pin_code}` : "",
    ]
      .filter(Boolean)
      .join(", ") || "—";
  const mobileNo = pd?.mobileNo ? `+91 ${pd.mobileNo}` : "—";
  const secondMobileNo = pd?.alternateMobileNo ? `+91 ${pd.alternateMobileNo}` : "—";
  const emailAddress = pd?.email || "—";

  return (
    <div className="prts-personal-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-personal-form-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title m-0">Review Personal Details</h1>
          </div>
        </div>

        <div className="prts-personal-accordion-group m-0 mt-6">
          <PrtsRegistrationAccordionSection title="Personal Details">
            <div className="prts-application-preview prts-application-preview--inline">
              <div className="prts-preview-grid prts-preview-grid--12 mb-5">
                <PreviewField label="Full Name" value={fullName} />
              </div>
              <div className="prts-preview-grid prts-preview-grid--12 mb-5">
                <PreviewField label="Permanent Address" value={permanentAddress} />
              </div>
              <div className="prts-preview-grid prts-preview-grid--4">
                <PreviewField label="Mobile No." value={mobileNo} />
                <PreviewField label="Second Mobile No." value={secondMobileNo} />
                <PreviewField label="Email Address" value={emailAddress} />
              </div>
            </div>
          </PrtsRegistrationAccordionSection>
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
