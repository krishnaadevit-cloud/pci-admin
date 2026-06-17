"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import PrtsVerticalStepper from "@/app/(full-page)/pharmacy/fresh-registration/PrtsVerticalStepper";
import { useDashboardSidebar } from "@/app/(full-page)/pharmacy/DashboardSidebarContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchApplicationTypesData,
  selectApplicationTypes,
  selectDashboardData,
  setRenewalPeriod,
  setEmploymentDetails,
  setApplicationUuid,
} from "@/store/slices";
import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";
import { RENEWAL_STEPS } from "./constants";

import DurationApplicantStep from "./steps/DurationApplicantStep";
import EmploymentDetailsStep from "./steps/EmploymentDetailsStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import RenewalApplicationPreview from "./RenewalApplicationPreview";
import { useDashboardGuard } from "@/app/(full-page)/pharmacy/hooks/useDashboardGuard";

export default function PrtsRenewalFlow() {
  const sidebar = useDashboardSidebar();
  const dispatch = useAppDispatch();
  const applicationTypes = useAppSelector(selectApplicationTypes);
  const dashboardData = useAppSelector(selectDashboardData);

  const toast = useRef<Toast>(null);
  const mainRef = useRef<HTMLElement>(null);

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationTrigger, setValidationTrigger] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const [renewalDocuments, setRenewalDocuments] = useState<DocumentRowState[]>([]);

  useEffect(() => {
    sidebar?.setIsOpen(false);
    if (applicationTypes.length === 0) {
      dispatch(fetchApplicationTypesData());
    }
  }, []);

  useEffect(() => {
    const details = dashboardData?.renewal_details;
    if (!details) return;
    if (details.uuid) dispatch(setApplicationUuid(details.uuid));
    const rd = details.renewal_details;
    if (rd?.renewal_period) dispatch(setRenewalPeriod(rd.renewal_period));
    if (rd?.employment_status != null) {
      dispatch(setEmploymentDetails({
        employmentStatus: rd.employment_status === 1 ? "yes" : "no",
        designation: rd.designation ?? "",
        organizationName: rd.organization_name ?? "",
        employmentFileUrl: rd.employment_file_url?.[0] ?? "",
      }));
    }
  }, [dashboardData]);

  useEffect(() => {
    if (showPreview) return;
    const id = setTimeout(() => {
      window.scrollTo(0, 0);
      mainRef.current?.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(id);
  }, [activeStep, showPreview]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const advanceFromStep = useCallback((stepId: number) => {
    setCompletedSteps((prev) => (prev.includes(stepId) ? prev : [...prev, stepId]));
    setActiveStep(stepId + 1);
  }, []);

  const goBack = useCallback(() => {
    if (activeStep > 1) {
      setActiveStep((s) => s - 1);
    }
  }, [activeStep]);

  const goToStep = useCallback(
    (targetStep: number) => {
      if (targetStep === activeStep) return;

      if (targetStep < activeStep) {
        setCompletedSteps((prev) => prev.filter((s) => s < targetStep));
        setActiveStep(targetStep);
        return;
      }

      for (let step = activeStep; step < targetStep; step += 1) {
        if (!completedSteps.includes(step)) {
          const stepLabel =
            RENEWAL_STEPS.find((s) => s.id === step)?.label ?? "previous step";
          toast.current?.show({
            severity: "warn",
            summary: "Cannot Navigate",
            detail: `Complete "${stepLabel}" before continuing.`,
            life: 5000,
          });
          if (step === activeStep) {
            setValidationTrigger((t) => t + 1);
          }
          return;
        }
      }

      setActiveStep(targetStep);
    },
    [activeStep, completedSteps],
  );

  const { isAllowed, isChecking } = useDashboardGuard("renewal_status");
  if (isChecking || !isAllowed) return null;

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <DurationApplicantStep
            onBack={goBack}
            onContinue={() => advanceFromStep(1)}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      case 2:
        return (
          <EmploymentDetailsStep
            onBack={goBack}
            onContinue={() => advanceFromStep(2)}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      case 3:
        return (
          <DocumentUploadStep
            onBack={goBack}
            onPreview={() => setShowPreview(true)}
            onDocumentsChange={setRenewalDocuments}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      default:
        return null;
    }
  };

  if (showPreview) {
    return (
      <div className="fresh-registration-container prts-pharmacy-scope">
        <Toast ref={toast} position="top-right" appendTo={document.body} />
        <RenewalApplicationPreview
          documents={renewalDocuments}
          onBack={() => setShowPreview(false)}
        />
      </div>
    );
  }

  return (
    <div className="fresh-registration-container prts-pharmacy-scope">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-registration-layout">
        <aside className="prts-registration-sidebar">
          <PrtsVerticalStepper
            title="Renewal Registration"
            steps={RENEWAL_STEPS}
            activeStep={activeStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </aside>
        <main ref={mainRef} className="prts-registration-main">
          {renderStep()}
        </main>
      </div>
    </div>
  );
}
