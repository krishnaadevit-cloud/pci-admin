"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFullRegistration } from "@/store/selectors";
import { fetchDashboardData, selectDashboardData } from "@/store/slices";
import PrtsVerticalStepper from "./PrtsVerticalStepper";
import { REGISTRATION_STEPS } from "./constants";
import EkycStep from "./steps/EkycStep";
import PersonalDetailsStep from "./steps/PersonalDetailsStep";
import EducationDetailsStep from "./steps/EducationDetailsStep";
import CommunicationDetailsStep from "./steps/CommunicationDetailsStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import ApplicationPreview from "./ApplicationPreview";
import PaymentConfirmDialog from "./PaymentConfirmDialog";
import {
  canNavigateToStep,
  getFirstValidationMessage,
  validateRegistrationStep,
} from "./stepValidation";
import { useRouter } from 'next/navigation';
import { registrationToSerializablePayload } from "./registrationState";
import PrtsDashboardSidebar from "../dashboard/PrtsDashboardSidebar";
import { useDashboardSidebar } from "../DashboardSidebarContext";
import { useDashboardGuard } from "../hooks/useDashboardGuard";

export default function PrtsRegistrationFlow() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sidebar = useDashboardSidebar();
  const sidebarOpen = sidebar?.isOpen ?? false;
  const closeSidebar = () => sidebar?.setIsOpen(false);
  const registration = useAppSelector(selectFullRegistration);
  const dashboardData = useAppSelector(selectDashboardData);

  useEffect(() => {
    sidebar?.setIsOpen(false);
  }, []);

  const toast = useRef<Toast>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!dashboardData) {
      dispatch(fetchDashboardData()).unwrap().catch((err: unknown) => {
        const message = (err as { message?: string })?.message ?? "Failed to load your details. Please try again.";
        toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
      });
    }
  }, []);

  const [activeStep, setActiveStepLocal] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => {
      window.scrollTo(0, 0);
      mainRef.current?.scrollTo(0, 0);
    }, 0);
    return () => clearTimeout(id);
  }, [activeStep, showPreview]);

  const showNavError = useCallback((message: string) => {
    toast.current?.show({ severity: "warn", summary: "Cannot Navigate", detail: message, life: 5000 });
  }, []);

  const markStepsCompletedUpTo = useCallback((targetStep: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      for (let step = 1; step < targetStep; step += 1) {
        next.add(step);
      }
      return Array.from(next).sort((a, b) => a - b);
    });
  }, []);

  const goToStep = useCallback(
    (targetStep: number) => {
      if (showPreview) {
        setShowPreview(false);
        setShowPaymentDialog(false);
      }

      const { allowed, errors, blockingStep } = canNavigateToStep(
        targetStep,
        activeStep,
        registration,
        completedSteps,
      );

      if (!allowed) {
        const message = getFirstValidationMessage(errors);
        const stepLabel =
          REGISTRATION_STEPS.find((s) => s.id === blockingStep)?.label ?? "previous step";
        showNavError(
          blockingStep
            ? `Complete "${stepLabel}" Before Continuing.`
            : message,
        );
        if (blockingStep === activeStep) {
          setValidationTrigger((t) => t + 1);
        }
        return;
      }

      if (targetStep > activeStep) {
        markStepsCompletedUpTo(targetStep);
      } else if (targetStep < activeStep) {
        setCompletedSteps((prev) => prev.filter((step) => step < targetStep));
      }

      setActiveStepLocal(targetStep);
    },
    [
      activeStep,
      completedSteps,
      markStepsCompletedUpTo,
      registration,
      showPreview,
    ],
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const advanceFromStep = useCallback(
    (stepId: number) => {
      const errors = validateRegistrationStep(stepId, registration, {
        ekycCompleted: completedSteps.includes(1),
      });

      if (Object.keys(errors).length > 0) {
        showNavError(getFirstValidationMessage(errors));
        return;
      }

      setCompletedSteps((prev) => (prev.includes(stepId) ? prev : [...prev, stepId]));
      setActiveStepLocal(stepId + 1);
    },
    [completedSteps, registration],
  );

  const exitPreview = useCallback(() => {
    setShowPreview(false);
    setShowPaymentDialog(false);
  }, []);

  const goBack = useCallback(() => {
    if (showPreview) {
      exitPreview();
      return;
    }
    if (activeStep > 1) {
      goToStep(activeStep - 1);
    }
  }, [activeStep, exitPreview, goToStep, showPreview]);

  const openPreview = useCallback(() => {
    const errors = validateRegistrationStep(5, registration, {
      ekycCompleted: completedSteps.includes(1),
    });
    if (Object.keys(errors).length > 0) {
      showNavError(getFirstValidationMessage(errors));
      return;
    }
    setShowPreview(true);
    setShowPaymentDialog(false);
  }, [completedSteps, registration]);

  const { isAllowed, isChecking } = useDashboardGuard("fresh_status");

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <EkycStep onComplete={() => advanceFromStep(1)} />
        );
      case 2:
        return (
          <PersonalDetailsStep
            onBack={goBack}
            onContinue={() => advanceFromStep(2)}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      case 3:
        return (
          <EducationDetailsStep
            onBack={goBack}
            onContinue={() => advanceFromStep(3)}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      case 4:
        return (
          <CommunicationDetailsStep
            onBack={goBack}
            onContinue={() => advanceFromStep(4)}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      case 5:
        return (
          <DocumentUploadStep
            onBack={goBack}
            onPreview={openPreview}
            onMakePayment={() => setShowPaymentDialog(true)}
          />
        );
      default:
        return null;
    }
  };

  const handlePaymentConfirm = useCallback(() => {
    setShowPaymentDialog(false);
    const body = registrationToSerializablePayload(registration);
    console.log("Fresh registration API body:", body);
    // alert("Registration body logged in console. Ready for API integration.");
    router.push("/pharmacy/payment-status");
  }, [registration]);

  if (isChecking || !isAllowed) return null;

  return (
    <div className="fresh-registration-container prts-pharmacy-scope">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-registration-layout">
        {showPreview ? (
          <div className="prts-document-wrapper">
            <ApplicationPreview
              onBack={exitPreview}
              onMakePayment={() => setShowPaymentDialog(true)}
            />
          </div>
        ) : (
          <div className="prts-dashboard-wrapper">
            <div
              className={`prts-sidebar-overlay ${sidebarOpen ? "prts-sidebar-overlay--visible" : ""}`}
              onClick={closeSidebar}
              role="presentation"
              aria-hidden={!sidebarOpen}
            />

            <PrtsDashboardSidebar isOpen={sidebarOpen} />

            <div className="prts-registration-layout">
              <aside className="prts-registration-sidebar">
                <PrtsVerticalStepper
                  steps={REGISTRATION_STEPS}
                  activeStep={activeStep}
                  completedSteps={completedSteps}
                  onStepClick={(stepId) => goToStep(stepId)}
                />
              </aside>
              <main ref={mainRef} className="prts-registration-main">
                {renderStep()}
              </main>
            </div>
          </div>
        )}

        <PaymentConfirmDialog
          visible={showPaymentDialog}
          onHide={() => setShowPaymentDialog(false)}
          onConfirm={handlePaymentConfirm}
        />
      </div>
    </div>
  );
}
