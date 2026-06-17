"use client";

import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDashboardData,
  selectDashboardData,
  selectOtherApplicationSubmitting,
  selectApplicationTypeByName,
  selectRenewalPeriod,
  setRenewalPeriod as saveRenewalPeriod,
  submitRenewalApplication,
} from "@/store/slices";
import PrtsRegistrationAccordionSection from "@/app/(full-page)/pharmacy/fresh-registration/forms/PrtsRegistrationAccordionSection";
import { loadUser } from "@/lib/auth/cookieStorage";

const RENEWAL_PERIODS = [
  { label: "1 Year", value: "1" },
  { label: "5 Year", value: "5" },
];

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="prts-preview-field">
      <span className="prts-preview-field__label">{label}</span>
      <span className="prts-preview-field__value">{value || "—"}</span>
    </div>
  );
}

interface DurationApplicantStepProps {
  onBack: () => void;
  onContinue: () => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

export default function DurationApplicantStep({ onBack, onContinue }: DurationApplicantStepProps) {
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const isSubmitting = useAppSelector(selectOtherApplicationSubmitting);
  const renewalApplicationType = useAppSelector(selectApplicationTypeByName("Renewal Registration"));
  const savedRenewalPeriod = useAppSelector(selectRenewalPeriod);
  const toast = useRef<Toast>(null);

  const [renewalPeriod, setRenewalPeriod] = useState(() => String(savedRenewalPeriod ?? 1));

  useEffect(() => {
    if (!dashboardData) {
      dispatch(fetchDashboardData()).unwrap().catch((err: unknown) => {
        const message = (err as { message?: string })?.message ?? "Failed to load your details. Please try again.";
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

  const handleSubmit = async () => {
    const user = loadUser();
    const period = renewalPeriod === "5" ? 5 : 1;

    const payload = {
      application_uuid: renewalApplicationType?.uuid ?? "",
      fresh_application_uuid:
        dashboardData?.fresh_application_uuid ?? "",
      user_uuid: user?.id ?? "",
      renewal_details: {
        renewal_period: period,
      },
    };

    const result = await dispatch(submitRenewalApplication(payload));

    if (submitRenewalApplication.fulfilled.match(result)) {
      dispatch(saveRenewalPeriod(period));
      onContinue();
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Submission Failed",
        detail:
          (result.payload as string) ??
          "Failed to submit renewal application. Please try again.",
        life: 5000,
      });
    }
  };

  return (
    <div className="prts-personal-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      <div className="prts-personal-form-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title m-0">Duration &amp; Applicant Details</h1>
          </div>
        </div>

        {/* Renewal Period */}
        <div className="prts-renewal-period-section">
          <span className="prts-renewal-period-section__label">
            Select Renewal Period:
            <span className="prts-required-asterisk">*</span>
          </span>
          <div className="prts-renewal-period-section__options">
            {RENEWAL_PERIODS.map((option) => (
              <label
                key={option.value}
                htmlFor={`renewal-${option.value}`}
                className="prts-renewal-period-section__option"
              >
                <input
                  type="radio"
                  id={`renewal-${option.value}`}
                  name="renewalPeriod"
                  value={option.value}
                  checked={renewalPeriod === option.value}
                  onChange={() => setRenewalPeriod(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Applicant Details */}
        <div className="prts-personal-accordion-group m-0">
          <PrtsRegistrationAccordionSection title="Applicant Details">
            <div className="prts-application-preview prts-application-preview--inline">
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
          </PrtsRegistrationAccordionSection>
        </div>

        <div className="prts-form-footer__actions mt-3">
          <button
            type="button"
            className="prts-btn prts-btn--outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`prts-btn prts-btn--primary${isSubmitting ? " prts-btn--disabled" : ""}`}
            disabled={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
