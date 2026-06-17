"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectApplicationTypeByName,
  fetchApplicationTypesData,
  selectApplicationTypes,
  selectDashboardData,
  patchDashboardData,
} from "@/store/slices";
import { getAllDetails } from "@/service/MDM_Service";
import { postData, deleteData } from "@/service/ApplicationService";
import {
  MDM_APPLICATION_DOCUMENTS,
  PHARMACY_SAVE_OTHER_DOCUMENT,
  PHARMACY_DELETE_OTHER_DOCUMENT,
  PHARMACY_SAVE_ADDRESS_CHANGE,
} from "@/config/ApiConstant";
import { loadUser } from "@/lib/auth/cookieStorage";
import UploadTableDoc from "@/app/(full-page)/pharmacy/fresh-registration/UploadTableDoc";
import { validatePdfFile } from "@/app/(full-page)/pharmacy/fresh-registration/pdfValidation";
import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";

interface DocumentUploadStepProps {
  onBack: () => void;
  onPreview: () => void;
  onDocumentsChange?: (docs: DocumentRowState[]) => void;
  initialDocuments?: DocumentRowState[];
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

export default function DocumentUploadStep({
  onBack,
  onPreview,
  onDocumentsChange,
  initialDocuments,
}: DocumentUploadStepProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const applicationTypes = useAppSelector(selectApplicationTypes);
  const changeAddressApplicationType = useAppSelector(selectApplicationTypeByName("Change In Address"));
  const dashboardData = useAppSelector(selectDashboardData);

  const toast = useRef<Toast>(null);
  const initialAppliedRef = useRef(false);
  const [documents, setDocuments] = useState<DocumentRowState[]>(initialDocuments ?? []);
  const documentsRef = useRef<DocumentRowState[]>(initialDocuments ?? []);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (applicationTypes.length === 0) {
      dispatch(fetchApplicationTypesData());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply initialDocuments if they arrive after first render (e.g. parent state prefill is async)
  useEffect(() => {
    if (initialAppliedRef.current) return;
    if (!initialDocuments?.length) return;
    initialAppliedRef.current = true;
    setDocuments(initialDocuments);
    documentsRef.current = initialDocuments;
    onDocumentsChange?.(initialDocuments);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDocuments]);

  useEffect(() => {
    if (documents.length > 0) return;
    if (!changeAddressApplicationType) return;

    const fetchDocuments = async () => {
      setLoadingDocs(true);
      try {
        const response = await getAllDetails(
          `${MDM_APPLICATION_DOCUMENTS}?applicationName=${encodeURIComponent(changeAddressApplicationType.applicationName)}`,
        );
        if (Array.isArray(response) && response.length > 0) {
          const rows: DocumentRowState[] = response.map((item: any, index: number) => ({
            id: item.id ?? index + 1,
            uuid: item.uuid,
            documentId: item.documentUuid,
            name: item.documentName ?? item.name ?? `Document ${index + 1}`,
            status: "pending",
            isRequired: !!item.isRequired,
            digiFetchDisabled: false,
          }));
          setDocuments(rows);
          documentsRef.current = rows;
          onDocumentsChange?.(rows);
        }
      } catch {
        toast.current?.show({
          severity: "error",
          summary: "Load Failed",
          detail: "Could not load document list. Please try again.",
          life: 5000,
        });
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDocuments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [changeAddressApplicationType]);

  const handleUpdate = (id: number, patch: Partial<DocumentRowState>) => {
    setDocuments((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...patch } : d));
      documentsRef.current = updated;
      onDocumentsChange?.(updated);
      return updated;
    });
  };

  const handleUploadComplete = async (id: number, file: File) => {
    const doc = documentsRef.current.find((d) => d.id === id);
    if (!doc) return;

    const authUser = loadUser();
    const formData = new FormData();
    formData.append("user_uuid", authUser?.id ?? "");
    formData.append("document_uuid", doc.documentId ?? "");
    formData.append("application_uuid", changeAddressApplicationType?.uuid ?? "");
    formData.append("file", file, file.name);
    formData.append("source", "MANUAL");

    try {
      const response = await postData(PHARMACY_SAVE_OTHER_DOCUMENT, formData);
      const data = response?.data ?? response;
      const serverUuid = data?.uuid;
      if (serverUuid) {
        handleUpdate(id, { uuid: serverUuid });
      }
      // Persist address_change_details in Redux so documents survive preview→back and page refresh
      const addressChangeDetails = data?.address_change_details;
      if (addressChangeDetails) {
        dispatch(patchDashboardData({ address_change_details: addressChangeDetails }));
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to save document. Please try again.";
      toast.current?.show({ severity: "error", summary: "Upload Error", detail: message, life: 5000 });
    }
  };

  const handleDelete = async (id: number) => {
    const doc = documentsRef.current.find((d) => d.id === id);
    if (!doc) return;

    const resetPatch: Partial<DocumentRowState> = {
      status: "pending",
      fileName: undefined,
      fileSize: undefined,
      fileObject: undefined,
      digiFetchDisabled: false,
      selected: false,
      uuid: undefined,
    };

    if (doc.fileObject || !doc.uuid) {
      handleUpdate(id, resetPatch);
      return;
    }

    try {
      await deleteData(PHARMACY_DELETE_OTHER_DOCUMENT, doc.uuid);
      handleUpdate(id, resetPatch);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to delete document. Please try again.";
      toast.current?.show({ severity: "error", summary: "Delete Failed", detail: message, life: 5000 });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const authUser = loadUser();
      await postData(PHARMACY_SAVE_ADDRESS_CHANGE, {
        application_uuid: changeAddressApplicationType?.uuid ?? "",
        fresh_application_uuid:
          dashboardData?.fresh_application_uuid ?? "",
        user_uuid: authUser?.id ?? "",
        address_change: true,
      });
      toast.current?.show({
        severity: "success",
        summary: "Submitted",
        detail: "Your address change application has been submitted successfully.",
        life: 3000,
      });
      setTimeout(() => router.push("/pharmacy/dashboard"), 3000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to submit application. Please try again.";
      toast.current?.show({ severity: "error", summary: "Submit Failed", detail: message, life: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const allRequiredUploaded =
    documents.length > 0 &&
    documents.filter((d) => d.isRequired).every((d) => d.status === "uploaded");

  return (
    <div className="prts-document-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      <div className="prts-document-table-card prts-fetch-documents">
        <div className="prts-fetch-documents__intro">
          <div>
            <Image
              src="/assets/fresh-registration/document.svg"
              alt="Document"
              width={37.72}
              height={35}
            />
            <h1 className="prts-fetch-documents__title">Fetch Documents</h1>
            <p className="prts-fetch-documents__desc">
              Please upload clear and valid scanned copies of all required documents in the
              prescribed format. Ensure that the information in your uploaded documents matches
              the details provided in your application form to avoid delays or rejection during
              verification.
            </p>
            <p className="prts-fetch-documents__constraint">
              Supported Formats: PDF
              <br />
              Maximum File Size: 1 MB per document
            </p>
          </div>
        </div>

        {loadingDocs ? (
          <div className="prts-docs-loading">
            <span>Loading documents…</span>
          </div>
        ) : (
          <UploadTableDoc
            title="Upload Documents"
            documents={documents}
            onUpdate={handleUpdate}
            onValidate={validatePdfFile}
            onValidationError={(msg) =>
              toast.current?.show({
                severity: "error",
                summary: "Invalid File",
                detail: msg,
                life: 6000,
              })
            }
            onUploadComplete={handleUploadComplete}
            onDelete={handleDelete}
            showDigiLocker={false}
          />
        )}
      </div>

      <div className="prts-document-footer">
        <div className="prts-form-footer prts-form-footer--documents">
          <div className="prts-document-footer__left">
            <button
              type="button"
              className="prts-btn prts-btn--outline"
              onClick={onBack}
            >
              Back
            </button>
          </div>
          <div className="prts-form-footer__actions">
            <button
              type="button"
              className={`prts-btn prts-btn--outline${!allRequiredUploaded ? " prts-btn--disabled" : ""}`}
              disabled={!allRequiredUploaded}
              onClick={onPreview}
            >
              Preview Application
            </button>
            <button
              type="button"
              className={`prts-btn prts-btn--primary${!allRequiredUploaded || isSubmitting ? " prts-btn--disabled" : ""}`}
              disabled={!allRequiredUploaded || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
