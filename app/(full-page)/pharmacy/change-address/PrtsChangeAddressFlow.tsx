"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import PrtsVerticalStepper from "@/app/(full-page)/pharmacy/fresh-registration/PrtsVerticalStepper";
import { useDashboardSidebar } from "@/app/(full-page)/pharmacy/DashboardSidebarContext";
import { useAppSelector } from "@/store/hooks";
import { selectDashboardData } from "@/store/slices";
import type {
  DocumentRowState,
  AddressState,
} from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";
import { CHANGE_ADDRESS_STEPS } from "./constants";
import ReviewAddressStep from "./steps/ReviewAddressStep";
import ChangeAddressStep from "./steps/ChangeAddressStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import ChangeAddressApplicationPreview from "./ChangeAddressApplicationPreview";
import { useDashboardGuard } from "@/app/(full-page)/pharmacy/hooks/useDashboardGuard";

export default function PrtsChangeAddressFlow() {
  const sidebar = useDashboardSidebar();
  const dashboardData = useAppSelector(selectDashboardData);
  const toast = useRef<Toast>(null);
  const mainRef = useRef<HTMLElement>(null);
  const prefillAppliedRef = useRef(false);

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationTrigger, setValidationTrigger] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const [newAddress, setNewAddress] = useState<AddressState | null>(null);
  const [documents, setDocuments] = useState<DocumentRowState[]>([]);

  useEffect(() => {
    sidebar?.setIsOpen(false);
  }, []);

  // Prefill other documents from dashboardData (handles both page refresh and post-upload Redux update)
  useEffect(() => {
    if (prefillAppliedRef.current) return;
    const otherDocs = dashboardData?.address_change_details?.other_documents;
    if (!otherDocs?.length) return;
    prefillAppliedRef.current = true;
    setDocuments(
      otherDocs.map((doc: any, idx: number) => {
        const isUploaded = !!(doc.download_url || doc.downloadUrl || doc.s3_object_key);
        const docName = doc.document_name ?? doc.documentName ?? `Document ${idx + 1}`;
        return {
          id: idx + 1,
          uuid: doc.uuid ?? undefined,
          documentId: doc.document_uuid ?? doc.documentUuid ?? undefined,
          name: docName,
          status: isUploaded ? ("uploaded" as const) : ("pending" as const),
          isRequired: doc.is_required ?? doc.isRequired ?? true,
          digiFetchDisabled: isUploaded,
          fileName: doc.s3_object_key?.split("/").pop() ?? (isUploaded ? docName : undefined),
          downloadUrl: doc.download_url ?? doc.downloadUrl ?? undefined,
          source: (doc.source as "MANUAL" | "DIGILOCKER") ?? undefined,
        };
      }),
    );
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
    if (activeStep > 1) setActiveStep((s) => s - 1);
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
            CHANGE_ADDRESS_STEPS.find((s) => s.id === step)?.label ?? "previous step";
          toast.current?.show({
            severity: "warn",
            summary: "Cannot Navigate",
            detail: `Complete "${stepLabel}" before continuing.`,
            life: 5000,
          });
          if (step === activeStep) setValidationTrigger((t) => t + 1);
          return;
        }
      }

      setActiveStep(targetStep);
    },
    [activeStep, completedSteps],
  );

  const { isAllowed, isChecking } = useDashboardGuard("address_change_status");
  if (isChecking || !isAllowed) return null;

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <ReviewAddressStep
            onBack={goBack}
            onContinue={() => advanceFromStep(1)}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      case 2:
        return (
          <ChangeAddressStep
            onBack={goBack}
            onContinue={() => advanceFromStep(2)}
            onAddressConfirmed={setNewAddress}
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
            initialDocuments={documents.length > 0 ? documents : undefined}
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
        <ChangeAddressApplicationPreview
          newAddress={newAddress}
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
            title="Change Address"
            steps={CHANGE_ADDRESS_STEPS}
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
