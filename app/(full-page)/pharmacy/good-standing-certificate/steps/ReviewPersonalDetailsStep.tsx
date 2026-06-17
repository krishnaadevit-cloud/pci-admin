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

  const pd = (dashboardData?.fresh_app_details?.personalDetails ?? {}) as Record<string, any>;
  const cd = (dashboardData?.fresh_app_details?.communicationDetails ?? {}) as Record<string, any>;
  const ed = (dashboardData?.fresh_app_details?.educationalDetails ?? {}) as Record<string, any>;
  const dd = (dashboardData as any) ?? {};

  // Personal Details
  const fullName =
    (pd.fullName ?? pd.full_name ??
    [pd.surname, pd.firstName, pd.middleName].filter(Boolean).join(" ")) || "—";
  const permanentAddress =
    [
      cd.permanent_address,
      cd.permanent_city,
      cd.permanent_state,
      cd.permanent_pin_code ? `- ${cd.permanent_pin_code}` : "",
    ]
      .filter(Boolean)
      .join(", ") || "—";
  const mobileNo = pd.mobileNo ? `+91 ${pd.mobileNo}` : "—";
  const secondMobileNo = pd.alternateMobileNo ? `+91 ${pd.alternateMobileNo}` : "—";
  const emailAddress = pd.email || "—";

  // Registrable Qualification
  const qualification = ed.qualification_name ?? ed.qualificationName ?? ed.qualification ?? "—";
  const institutionCode = ed.pci_code ?? ed.college_institution_code ?? ed.institutionCode ?? ed.institution_code ?? "—";
  const collegeName = ed.college_name ?? ed.collegeName ?? ed.college ?? "—";
  const yearOfAdmission = ed.college_joining_year ?? ed.joiningYear ?? ed.joining_year ?? "—";
  const yearOfPassing = ed.college_passed_year ?? ed.passedYear ?? ed.passed_year ?? "—";

  // Registration Details
  const registrationNo = dd.registration_no ?? pd.registrationNo ?? "—";
  const dateOfRegistration = dd.registration_date ?? pd.registrationDate ?? pd.registration_date ?? "—";
  const dateOfValidity = dd.validity_date ?? pd.validityDate ?? pd.validity_date ?? pd.validUpto ?? "—";

  return (
    <div className="prts-personal-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-personal-form-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title m-0">Review Personal Details</h1>
          </div>
        </div>

        <div className="prts-personal-accordion-group m-0 mt-4">
          <PrtsRegistrationAccordionSection title="Personal Details">
            <div className="prts-application-preview prts-application-preview--inline">
              <div className="prts-preview-grid prts-preview-grid--4">
                <PreviewField label="Full Name" value={fullName} />
                <PreviewField label="Mobile No." value={mobileNo} />
                <PreviewField label="Second Mobile No." value={secondMobileNo} />
                <PreviewField label="Email Address" value={emailAddress} />
              </div>
              <div className="prts-preview-grid prts-preview-grid--2">
                <PreviewField label="Permanent Address" value={permanentAddress} />
              </div>
            </div>
          </PrtsRegistrationAccordionSection>

          <PrtsRegistrationAccordionSection title="Registrable Qualification">
            <div className="prts-application-preview prts-application-preview--inline">
              <div className="prts-preview-grid prts-preview-grid--3">
                <PreviewField label="Qualification" value={qualification} />
                <PreviewField label="Institution Code" value={institutionCode} />
                <PreviewField label="College Name" value={collegeName} />
              </div>
              <div className="prts-preview-grid prts-preview-grid--2">
                <PreviewField label="Year of Admission" value={yearOfAdmission} />
                <PreviewField label="Year of Passing" value={yearOfPassing} />
              </div>
            </div>
          </PrtsRegistrationAccordionSection>

          <PrtsRegistrationAccordionSection title="Registration Details">
            <div className="prts-application-preview prts-application-preview--inline">
              <div className="prts-preview-grid prts-preview-grid--3">
                <PreviewField label="Pharmacist Registration No." value={registrationNo} />
                <PreviewField label="Date of Registration" value={dateOfRegistration} />
                <PreviewField label="Date of Validity" value={dateOfValidity} />
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
