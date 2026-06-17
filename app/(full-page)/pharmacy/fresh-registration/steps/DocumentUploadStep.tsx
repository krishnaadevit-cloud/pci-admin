"use client";

import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetDocuments,
  selectDocuments,
  setDocuments,
  updateDocument,
  selectApplicationTypeByName,
  fetchApplicationTypesData,
  selectApplicationTypes,
} from "@/store/slices";
import { selectApplicationId } from "@/store/selectors/freshRegistrationSelectors";
import Image from "next/image";
import UploadTableDoc from "../UploadTableDoc";
import PaymentConfirmDialog from "../PaymentConfirmDialog";
import { getAllDetails } from "@/service/MDM_Service";
import { postData, deleteData } from "@/service/ApplicationService";
import { postData as paymentPostData } from "@/service/Payment_Service";
import { MDM_APPLICATION_DOCUMENTS, PHARMACY_SAVE_OTHER_DOCUMENT, PHARMACY_DELETE_OTHER_DOCUMENT, CREATE_PAYMENT_ORDER, CREATE_ORDER } from "@/config/ApiConstant";
import { loadUser } from "@/lib/auth/cookieStorage";
import type { DocumentRowState } from "../registrationState";
import { initiateDigilocker, type DigilockerDoc } from "@/services/authService";
import { validatePdfFile } from "../pdfValidation";

const DIGILOCKER_PENDING_DOCS_KEY = "digilocker_pending_docs";

interface FeeItem {
  label: string;
  value: number;
}

interface DocumentUploadStepProps {
  onBack: () => void;
  onPreview: () => void;
  onMakePayment: () => void;
}

export default function DocumentUploadStep({
  onBack,
  onPreview,
  onMakePayment,
}: DocumentUploadStepProps) {
  const dispatch = useAppDispatch();
  const documents = useAppSelector(selectDocuments);
  const applicationId = useAppSelector(selectApplicationId);
  const applicationTypes = useAppSelector(selectApplicationTypes);
  const freshApplicationType = useAppSelector(selectApplicationTypeByName("Fresh Registration"));

  const toast = useRef<Toast>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [feeStructure, setFeeStructure] = useState<FeeItem[]>([]);
  const [feeTotal, setFeeTotal] = useState(0);
  const [digiLockerLoading, setDigiLockerLoading] = useState(false);
  const [pendingDigiDocs, setPendingDigiDocs] = useState<DigilockerDoc[]>([]);

  const handleUploadComplete = async (id: number, file: File) => {
    const doc = documents.find((d) => d.id === id);
    console.log(doc, 'docsss')
    if (!doc) return;

    const authUser = loadUser();
    const formData = new FormData();
    formData.append("user_uuid", authUser?.id ?? "");
    formData.append("application_uuid", freshApplicationType?.uuid ?? "");
    formData.append("document_uuid", doc.documentId ?? "");
    formData.append(`file`, file, file.name);
    formData.append(`source`, "MANUAL");

    try {
      const response = await postData(PHARMACY_SAVE_OTHER_DOCUMENT, formData);
      const serverUuid = response?.data?.uuid ?? response?.uuid;
      if (serverUuid) {
        dispatch(updateDocument({ id, patch: { uuid: serverUuid } }));
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
    const doc = documents.find((d) => d.id === id);
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

    if (doc.fileObject) {
      dispatch(updateDocument({ id, patch: resetPatch }));
      return;
    }

    if (!doc.uuid) {
      dispatch(updateDocument({ id, patch: resetPatch }));
      return;
    }

    try {
      await deleteData(PHARMACY_DELETE_OTHER_DOCUMENT, doc.uuid);
      dispatch(updateDocument({ id, patch: resetPatch }));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to delete document. Please try again.";
      toast.current?.show({ severity: "error", summary: "Delete Failed", detail: message, life: 5000 });
    }
  };

  const handleDigiLockerClick = async () => {
    setDigiLockerLoading(true);
    try {
      const data = await initiateDigilocker();
      sessionStorage.setItem("digilocker_state", data.state);
      window.location.href = data.authorizationUrl;
    } catch {
      toast.current?.show({
        severity: "error",
        summary: "DigiLocker Error",
        detail: "Could not initiate DigiLocker. Please try again.",
        life: 5000,
      });
      setDigiLockerLoading(false);
    }
  };

  // On mount: pick up any documents the user selected on the callback page.
  useEffect(() => {
    const raw = sessionStorage.getItem(DIGILOCKER_PENDING_DOCS_KEY);
    if (!raw) return;
    sessionStorage.removeItem(DIGILOCKER_PENDING_DOCS_KEY);
    try {
      const docs = JSON.parse(raw) as DigilockerDoc[];
      if (docs.length > 0) setPendingDigiDocs(docs);
    } catch {}
  }, []);

  // Apply pending DigiLocker docs once the document list has loaded.
  useEffect(() => {
    if (pendingDigiDocs.length === 0 || documents.length === 0) return;

    const claimedIds = new Set<number>();
    for (const doc of pendingDigiDocs) {
      const nameMatch = documents.find(
        (r) =>
          !claimedIds.has(r.id) &&
          r.status === "pending" &&
          r.name.toLowerCase().includes(doc.name.toLowerCase().split(" ")[0]),
      );
      const fallback = documents.find(
        (r) => !claimedIds.has(r.id) && r.status === "pending",
      );
      const target = nameMatch ?? fallback;
      if (!target) continue;
      claimedIds.add(target.id);
      dispatch(
        updateDocument({
          id: target.id,
          patch: {
            status: "uploaded",
            fileName: doc.name,
            fileSize: doc.issuedAt ? `Issued: ${doc.issuedAt}` : "via DigiLocker",
            source: "DIGILOCKER",
            digilockerUri: doc.uri,
            digiFetchDisabled: true,
            selected: true,
            fileObject: undefined,
          },
        }),
      );
    }
    setPendingDigiDocs([]);
  }, [pendingDigiDocs, documents]);

  const handleMakePayment = async () => {
    setPaymentLoading(true);
    try {
      const authUser = loadUser();
      const response = await paymentPostData(CREATE_PAYMENT_ORDER, {
        user_uuid: authUser?.id ?? "",
        applicationName: freshApplicationType?.applicationName,
      });
      const data = response?.data ?? response;
      const fees: FeeItem[] = data?.fee_structure ?? [];
      const total: number = data?.total ?? 0;
      setFeeStructure(fees);
      setFeeTotal(total);
      setPaymentDialog(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to initiate payment. Please try again.";
      toast.current?.show({ severity: "error", summary: "Payment Error", detail: message, life: 5000 });
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setPaymentLoading(true);
    try {
      const authUser = loadUser();
      const response = await paymentPostData(CREATE_ORDER, {
        user_uuid: authUser?.id ?? "",
        applicationName: freshApplicationType?.applicationName,
        application_uuid: applicationId ?? "",
      });
      const data = response?.data ?? response;
      const sessionId = data?.payment_session_id;
      if (sessionId) {
        const { load } = await import("@cashfreepayments/cashfree-js");
        const cashfree = await load({
          mode: (process.env.NEXT_PUBLIC_CASHFREE_MODE ?? "sandbox") as "sandbox" | "production",
        });
        cashfree.checkout({ paymentSessionId: sessionId, redirectTarget: "_self" });
      } else {
        setPaymentDialog(false);
        onMakePayment();
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to create payment order. Please try again.";
      toast.current?.show({ severity: "error", summary: "Payment Error", detail: message, life: 5000 });
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    if (applicationTypes.length === 0) {
      dispatch(fetchApplicationTypesData());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (documents.length > 0) return;
    if (!freshApplicationType) return;

    const fetchDocuments = async () => {
      setLoadingDocs(true);
      try {
        const response = await getAllDetails(
          `${MDM_APPLICATION_DOCUMENTS}?applicationName=${encodeURIComponent(freshApplicationType.applicationName)}`,
        );
        if (Array.isArray(response) && response.length > 0) {
          const rows: DocumentRowState[] = response.map(
            (item: any, index: number) => ({
              id: item.id ?? index + 1,
              uuid: item.uuid,
              documentId: item.documentUuid,
              name: item.documentName ?? item.name ?? `Document ${index + 1}`,
              status: "pending",
              isRequired: !!item.isRequired,
              digiFetchDisabled: false,
            }),
          );
          dispatch(setDocuments(rows));
        } else {
          dispatch(setDocuments([]));
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
  }, [freshApplicationType]);

  const allRequiredUploaded =
    documents.length > 0 &&
    documents.filter((d) => d.isRequired).every((d) => d.status === "uploaded");

  return (
    <div className="prts-document-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      <PaymentConfirmDialog
        visible={paymentDialog}
        onHide={() => setPaymentDialog(false)}
        onConfirm={handleConfirmPayment}
        feeStructure={feeStructure}
        total={feeTotal}
        loading={paymentLoading}
      />

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
              prescribed format. Ensure that the information in your uploaded documents matches the
              details provided in your application form to avoid delays or rejection during
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
            onUpdate={(id, patch) => dispatch(updateDocument({ id, patch }))}
            onValidate={validatePdfFile}
            onValidationError={(msg) => toast.current?.show({ severity: "error", summary: "Invalid File", detail: msg, life: 6000 })}
            onUploadComplete={handleUploadComplete}
            onDelete={handleDelete}
            onDigiLockerClick={handleDigiLockerClick}
            digiLockerLoading={digiLockerLoading}
          />
        )}
      </div>

      <div className="prts-document-footer">
        <div className="prts-form-footer prts-form-footer--documents">
          <div className="prts-document-footer__left">
            <button
              type="button"
              className="prts-form-footer__reset"
              onClick={() => dispatch(resetDocuments())}
            >
              Reset all
            </button>
            <button type="button" className="prts-btn prts-btn--outline" onClick={onBack}>
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
              className={`prts-btn prts-btn--primary${!allRequiredUploaded || paymentLoading ? " prts-btn--disabled" : ""}`}
              disabled={!allRequiredUploaded || paymentLoading}
              onClick={handleMakePayment}
            >
              {paymentLoading ? "Processing..." : "Make Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
