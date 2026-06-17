"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import PrtsVerticalStepper from "@/app/(full-page)/pharmacy/fresh-registration/PrtsVerticalStepper";
import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";
import { GOOD_STANDING_CERTIFICATE_STEPS, type PharmacistReference } from "./constants";
import ReviewPersonalDetailsStep from "./steps/ReviewPersonalDetailsStep";
import PharmacistReferencesStep from "./steps/PharmacistReferencesStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import GoodStandingCertificateApplicationPreview from "./GoodStandingCertificateApplicationPreview";
import { useDashboardGuard } from "@/app/(full-page)/pharmacy/hooks/useDashboardGuard";

interface PharmacistReferences {
  pharmacist1: PharmacistReference;
  pharmacist2: PharmacistReference;
}

export default function PrtsGoodStandingCertificateFlow() {
  const toast = useRef<Toast>(null);
  const mainRef = useRef<HTMLElement>(null);

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationTrigger, setValidationTrigger] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const [pharmacistReferences, setPharmacistReferences] = useState<PharmacistReferences | null>(null);
  const [documents, setDocuments] = useState<DocumentRowState[]>([]);

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
            GOOD_STANDING_CERTIFICATE_STEPS.find((s) => s.id === step)?.label ?? "previous step";
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

  const { isAllowed, isChecking } = useDashboardGuard("good_standing_status");
  if (isChecking || !isAllowed) return null;

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <ReviewPersonalDetailsStep
            onBack={goBack}
            onContinue={() => advanceFromStep(1)}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      case 2:
        return (
          <PharmacistReferencesStep
            onBack={goBack}
            onContinue={(refs) => {
              setPharmacistReferences(refs);
              advanceFromStep(2);
            }}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      case 3:
        return (
          <DocumentUploadStep
            onBack={goBack}
            onPreview={() => setShowPreview(true)}
            onDocumentsChange={setDocuments}
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
        <GoodStandingCertificateApplicationPreview
          pharmacistReferences={pharmacistReferences}
          documents={documents}
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
            title="Good Standing Certificate"
            steps={GOOD_STANDING_CERTIFICATE_STEPS}
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
