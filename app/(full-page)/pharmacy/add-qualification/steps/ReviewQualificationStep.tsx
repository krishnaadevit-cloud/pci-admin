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

interface ReviewQualificationStepProps {
  onBack: () => void;
  onContinue: () => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

export default function ReviewQualificationStep({ onBack, onContinue }: ReviewQualificationStepProps) {
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (!dashboardData) {
      dispatch(fetchDashboardData()).unwrap().catch((err: unknown) => {
        const message = (err as { message?: string })?.message ?? "Failed to load qualification details. Please try again.";
        toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
      });
    }
  }, []);

  const ed = (dashboardData?.fresh_app_details?.educationalDetails ?? {}) as Record<string, any>;

  const qualification =
    ed.qualification_name ?? ed.qualificationName ?? ed.qualification ?? "—";
  const institutionCode =
    ed.college_institution_code ?? ed.institutionCode ?? ed.institution_code ?? "—";
  const college =
    ed.college_name ?? ed.collegeName ?? ed.college ?? "—";
  const joiningYear =
    ed.college_joining_year ?? ed.joiningYear ?? ed.joining_year ?? "—";
  const passedYear =
    ed.college_passed_year ?? ed.passedYear ?? ed.passed_year ?? "—";

  return (
    <div className="prts-personal-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-personal-form-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title m-0">Review Qualification Details</h1>
          </div>
        </div>

        <div className="prts-application-preview prts-application-preview--inline mt-4">
          <div className="prts-preview-grid prts-preview-grid--3">
            <PreviewField label="Qualification" value={qualification} />
            <PreviewField label="Institution Code" value={institutionCode} />
            <PreviewField label="College / Institute Name" value={college} />
          </div>
          <div className="prts-preview-grid prts-preview-grid--2">
            <PreviewField label="Joining Year" value={joiningYear} />
            <PreviewField label="Passed Year" value={passedYear} />
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
