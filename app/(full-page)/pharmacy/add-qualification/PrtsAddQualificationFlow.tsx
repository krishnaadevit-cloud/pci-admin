"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import PrtsVerticalStepper from "@/app/(full-page)/pharmacy/fresh-registration/PrtsVerticalStepper";
import { useDashboardSidebar } from "@/app/(full-page)/pharmacy/DashboardSidebarContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectDashboardData, setApplicationUuid } from "@/store/slices";
import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";
import { fetchCollegeByPciCode, fetchQualificationDegrees } from "@/services/educationService";
import {
  ADD_QUAL_STEPS,
  INITIAL_QUAL_FORM,
  type QualForm,
} from "./constants";
import ReviewQualificationStep from "./steps/ReviewQualificationStep";
import AddQualificationStep from "./steps/AddQualificationStep";
import DocumentUploadStep from "./steps/DocumentUploadStep";
import AddQualificationApplicationPreview from "./AddQualificationApplicationPreview";
import { useDashboardGuard } from "@/app/(full-page)/pharmacy/hooks/useDashboardGuard";

export default function PrtsAddQualificationFlow() {
  const sidebar = useDashboardSidebar();
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);

  const toast = useRef<Toast>(null);
  const mainRef = useRef<HTMLElement>(null);
  const prefillAppliedRef = useRef(false);

  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [validationTrigger, setValidationTrigger] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Step 2 state — new qualification form and its dynamic documents
  const [qualForm, setQualForm] = useState<QualForm>({ ...INITIAL_QUAL_FORM });
  const [qualDocuments, setQualDocuments] = useState<DocumentRowState[]>([]);

  // Step 3 state — synced from self-contained DocumentUploadStep
  const [generalDocuments, setGeneralDocuments] = useState<DocumentRowState[]>([]);

  useEffect(() => {
    sidebar?.setIsOpen(false);
  }, []);

  useEffect(() => {
    if (prefillAppliedRef.current) return;
    const details = dashboardData?.degree_add_details;
    if (!details) return;
    prefillAppliedRef.current = true;

    // Store the application instance UUID so DocumentUploadStep can use it for payment
    if (details.uuid) dispatch(setApplicationUuid(details.uuid));

    // Pre-build other documents (Step 3) from saved other_documents — same as fresh-registration
    // passing initialDocuments skips the MDM fetch in DocumentUploadStep
    const otherDocs = details.other_documents ?? [];
    if (otherDocs.length > 0) {
      setGeneralDocuments(
        otherDocs.map((doc: any, idx: number) => {
          // API may return camelCase (downloadUrl) or snake_case (download_url) — handle both
          const isUploaded = !!(doc.download_url || doc.downloadUrl || doc.s3_object_key);
          const docName = doc.document_name ?? doc.documentName ?? `Document ${idx + 1}`;
          const downloadUrl = doc.download_url ?? doc.downloadUrl ?? undefined;
          return {
            id: idx + 1,
            uuid: doc.uuid ?? undefined,
            documentId: doc.document_uuid ?? doc.documentUuid ?? undefined,
            name: docName,
            status: isUploaded ? ("uploaded" as const) : ("pending" as const),
            isRequired: doc.is_required ?? doc.isRequired ?? true,
            digiFetchDisabled: isUploaded,
            fileName: doc.s3_object_key?.split("/").pop() ?? (isUploaded ? docName : undefined),
            downloadUrl,
            source: (doc.source as "MANUAL" | "DIGILOCKER") ?? undefined,
          };
        }),
      );
    }

    const dd = details.degree_addition_details;
    if (!dd) return;

    const savedEduDocs: any[] = dd.educational_documents ?? [];

    const baseForm: Partial<QualForm> = {
      qualificationId: dd.new_qualification_uuid ?? "",
      institutionCode: dd.institute_pci_code ?? "",
      college: dd.college_name ?? "",
      joiningYear: dd.joining_year ?? "",
      passedYear: dd.passing_year ?? "",
      hospital: dd.hospital_master_uuid ?? "",
    };

    // Set form fields immediately so table condition (form.qualificationId) is true on render
    setQualForm((prev) => ({ ...prev, ...baseForm }));

    // Fetch the FULL required-doc list for the qualification (same as handleQualificationChange),
    // then merge upload status from savedEduDocs — following EducationQualificationSection pattern
    if (dd.new_qualification_uuid) {
      fetchQualificationDegrees(dd.new_qualification_uuid)
        .then((data: any) => {
          const rawDocs: any[] = Array.isArray(data) ? data : (data?.documents ?? []);
          const merged: DocumentRowState[] = rawDocs.map((doc: any, idx: number) => {
            const saved = savedEduDocs.find(
              (s: any) => s.qualification_document_uuid === doc.uuid,
            );
            const isUploaded = !!(saved?.s3_object_key || saved?.download_url || (saved as any)?.downloadUrl);
            const docName = doc.documentName ?? `Document ${idx + 1}`;
            const downloadUrl = saved?.download_url ?? (saved as any)?.downloadUrl ?? undefined;
            return {
              id: doc.id ?? idx + 1,
              uuid: saved?.uuid ?? undefined,
              qualificationDocumentUuid: doc.uuid,
              name: docName,
              status: isUploaded ? ("uploaded" as const) : ("pending" as const),
              isRequired: doc.isRequired ?? true,
              digiFetchDisabled: isUploaded,
              fileName: saved?.s3_object_key?.split("/").pop() ?? (isUploaded ? (saved?.document_name ?? docName) : undefined),
              downloadUrl,
              source: (saved?.source as "MANUAL" | "DIGILOCKER") ?? undefined,
            };
          });
          setQualDocuments(merged);
        })
        .catch(() => {
          // Fallback: use savedEduDocs directly if fetchQualificationDegrees fails
          if (savedEduDocs.length > 0) {
            setQualDocuments(
              savedEduDocs.map((doc: any, idx: number) => ({
                id: parseInt(doc.qualification_document_id, 10) || idx + 1,
                uuid: doc.uuid ?? undefined,
                qualificationDocumentUuid: doc.qualification_document_uuid ?? undefined,
                name: doc.document_name ?? `Document ${idx + 1}`,
                status: doc.s3_object_key ? ("uploaded" as const) : ("pending" as const),
                isRequired: doc.is_required ?? true,
                digiFetchDisabled: doc.s3_object_key ? true : false,
                fileName: doc.s3_object_key?.split("/").pop(),
                downloadUrl: doc.download_url ?? undefined,
                source: (doc.source as "MANUAL" | "DIGILOCKER") ?? undefined,
              })),
            );
          }
        });
    }

    // Resolve college UUID by PCI code so the college dropdown renders the correct option
    if (dd.institute_pci_code) {
      fetchCollegeByPciCode(dd.institute_pci_code)
        .then((data: any) => {
          const list: any[] = Array.isArray(data) ? data : data ? [data] : [];
          const match = list.find(
            (c) => c.collegeName?.toLowerCase() === dd.college_name?.toLowerCase(),
          );
          setQualForm((prev) => ({
            ...prev,
            collegeId: match?.uuid ?? "",
          }));
        })
        .catch(() => {});
    }
  }, [dashboardData, dispatch]);

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
            ADD_QUAL_STEPS.find((s) => s.id === step)?.label ?? "previous step";
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

  // QualForm updater — passed to AddQualificationStep
  const handleQualUpdate = useCallback((key: keyof QualForm, value: string) => {
    setQualForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Qualification documents (Step 2 — fetched from API per qualification)
  const handleQualDocumentUpdate = useCallback(
    (id: number, patch: Partial<DocumentRowState>) => {
      setQualDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      );
    },
    [],
  );

  const { isAllowed, isChecking } = useDashboardGuard("degree_add_status");
  if (isChecking || !isAllowed) return null;

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <ReviewQualificationStep
            onBack={goBack}
            onContinue={() => advanceFromStep(1)}
            validationTrigger={validationTrigger}
            onScrollToTop={scrollToTop}
          />
        );
      case 2:
        return (
          <AddQualificationStep
            form={qualForm}
            onUpdate={handleQualUpdate}
            qualDocuments={qualDocuments}
            onQualDocumentUpdate={handleQualDocumentUpdate}
            onQualDocumentsReplaced={setQualDocuments}
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
            onDocumentsChange={setGeneralDocuments}
            initialDocuments={generalDocuments.length > 0 ? generalDocuments : undefined}
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
        <AddQualificationApplicationPreview
          qualForm={qualForm}
          qualDocuments={qualDocuments}
          documents={generalDocuments}
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
            title="Add Qualification"
            steps={ADD_QUAL_STEPS}
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
