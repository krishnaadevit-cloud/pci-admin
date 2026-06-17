"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Toast } from "primereact/toast";
import { useAppSelector } from "@/store/hooks";
import { selectDashboardData } from "@/store/slices";
import PrtsRegistrationAccordionSection from "@/app/(full-page)/pharmacy/fresh-registration/forms/PrtsRegistrationAccordionSection";
import PaymentConfirmDialog from "@/app/(full-page)/pharmacy/fresh-registration/PaymentConfirmDialog";
import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";
import type { QualForm } from "./constants";
import { ADD_QUAL_MOCK_FEE_STRUCTURE, ADD_QUAL_MOCK_FEE_TOTAL } from "./constants";

interface AddQualificationApplicationPreviewProps {
  qualForm: QualForm;
  qualDocuments: DocumentRowState[];
  documents: DocumentRowState[];
  onBack: () => void;
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="prts-preview-field">
      <span className="prts-preview-field__label">{label}</span>
      <span className="prts-preview-field__value">{value || "—"}</span>
    </div>
  );
}

function PreviewDocumentsTable({ documents }: { documents: DocumentRowState[] }) {
  const viewFile = (row: DocumentRowState) => {
    if (row.downloadUrl) {
      window.open(row.downloadUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!row.fileObject) return;
    const url = URL.createObjectURL(row.fileObject);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  };

  return (
    <div className="prts-education-documents prts-education-documents--preview">
      <div className="prts-html-table-wrapper prts-html-table-wrapper--documents prts-html-table-wrapper--preview-docs prts-html-table-wrapper--preview-only">
        <table className="prts-html-table prts-html-table--documents prts-html-table--preview-only">
          <thead>
            <tr>
              <th className="prts-html-table__col-check" />
              <th className="prts-html-table__col-no">No.</th>
              <th>Document Name</th>
              <th className="prts-html-table__col-upload_preview">View</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((row, index) => (
              <tr
                key={row.id}
                className={row.status === "uploaded" ? "prts-doc-row--success" : ""}
              >
                <td className="prts-html-table__col-check">
                  <input
                    type="checkbox"
                    checked={row.status === "uploaded"}
                    disabled
                    readOnly
                    className={`prts-table-checkbox ${
                      row.status === "uploaded" ? "prts-table-checkbox--success" : ""
                    }`}
                    aria-label={row.name}
                  />
                </td>
                <td className="prts-html-table__col-no">{index + 1}</td>
                <td>
                  <span className="prts-doc-name">
                    {row.name}
                    {row.isRequired && (
                      <span className="prts-required-asterisk">*</span>
                    )}
                  </span>
                </td>
                <td className="prts-html-table__col-upload_preview">
                  {row.status === "uploaded" && row.fileName ? (
                    <div className="prts-doc-cell">
                      <div className="prts-doc-cell__file">
                        <Image
                          src="/assets/fresh-registration/pdf.svg"
                          alt="PDF"
                          width={40}
                          height={48}
                          onClick={() => viewFile(row)}
                          style={{ cursor: "pointer" }}
                        />
                        <div className="prts-doc-cell__file-info" />
                      </div>
                    </div>
                  ) : (
                    <span className="prts-doc-cell__no-file">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AddQualificationApplicationPreview({
  qualForm,
  qualDocuments,
  documents,
  onBack,
}: AddQualificationApplicationPreviewProps) {
  const toast = useRef<Toast>(null);
  const dashboardData = useAppSelector(selectDashboardData);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);

  const ed = (dashboardData?.fresh_app_details?.educationalDetails ?? {}) as Record<string, any>;
  const currentQualification =
    ed.qualification_name ?? ed.qualificationName ?? ed.qualification ?? "—";
  const currentInstitutionCode =
    ed.college_institution_code ?? ed.institutionCode ?? "—";
  const currentCollege =
    ed.college_name ?? ed.collegeName ?? ed.college ?? "—";
  const currentJoiningYear =
    ed.college_joining_year ?? ed.joiningYear ?? "—";
  const currentPassedYear =
    ed.college_passed_year ?? ed.passedYear ?? "—";

  const handleMakePayment = () => {
    // TODO: replace with API call to CREATE_PAYMENT_ORDER when backend is ready
    setPaymentLoading(true);
    setTimeout(() => {
      setPaymentLoading(false);
      setPaymentDialog(true);
    }, 600);
  };

  const handleConfirmPayment = () => {
    // TODO: integrate Cashfree payment session when backend is ready
    setPaymentDialog(false);
  };

  return (
    <div className="prts-application-preview">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      <PaymentConfirmDialog
        visible={paymentDialog}
        onHide={() => setPaymentDialog(false)}
        onConfirm={handleConfirmPayment}
        feeStructure={ADD_QUAL_MOCK_FEE_STRUCTURE}
        total={ADD_QUAL_MOCK_FEE_TOTAL}
        loading={paymentLoading}
      />

      <div className="prts-application-preview__header">
        <div>
          <h1 className="prts-application-preview__title">Application Preview</h1>
          <p className="prts-application-preview__subtitle">
            Review all details before proceeding to payment.
          </p>
        </div>
        {dashboardData?.degree_add_details?.uuid && (
          <div className="prts-application-preview__id">
            <span className="prts-application-preview__id-label">Application No.:</span>
            <span className="prts-application-preview__id-value">
              {dashboardData.degree_add_details.uuid}
            </span>
          </div>
        )}
      </div>

      <div className="prts-personal-accordion-group">
        {/* Current qualification from dashboard */}
        <PrtsRegistrationAccordionSection
          title="Current Qualification Details"
          sectionClassName="prts-preview-panel__body"
        >
          <div className="prts-preview-grid prts-preview-grid--3">
            <PreviewField label="Qualification" value={currentQualification} />
            <PreviewField label="Institution Code" value={currentInstitutionCode} />
            <PreviewField label="College / Institute Name" value={currentCollege} />
          </div>
          <div className="prts-preview-grid prts-preview-grid--2">
            <PreviewField label="Joining Year" value={currentJoiningYear} />
            <PreviewField label="Passed Year" value={currentPassedYear} />
          </div>
        </PrtsRegistrationAccordionSection>

        {/* New qualification from Step 2 */}
        <PrtsRegistrationAccordionSection
          title="New Qualification Details"
          sectionClassName="prts-preview-panel__body"
        >
          <div className="prts-preview-grid prts-preview-grid--3">
            <PreviewField label="Qualification" value={qualForm.qualification} />
            <PreviewField label="Institution Code" value={qualForm.institutionCode} />
            <PreviewField label="College / Institute Name" value={qualForm.college} />
          </div>
          <div className="prts-preview-grid prts-preview-grid--2">
            <PreviewField label="Joining Year" value={qualForm.joiningYear} />
            <PreviewField label="Passed Year" value={qualForm.passedYear} />
          </div>
          {qualDocuments.length > 0 && (
            <PreviewDocumentsTable documents={qualDocuments} />
          )}
        </PrtsRegistrationAccordionSection>

        {/* Step 3 — other documents */}
        {documents.length > 0 && (
          <PrtsRegistrationAccordionSection
            title="Documents"
            sectionClassName="prts-preview-panel__body"
          >
            <PreviewDocumentsTable documents={documents} />
          </PrtsRegistrationAccordionSection>
        )}
      </div>

      <div className="prts-application-preview__footer">
        <button type="button" className="prts-btn prts-btn--outline" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className={`prts-btn prts-btn--primary${paymentLoading ? " prts-btn--disabled" : ""}`}
          disabled={paymentLoading}
          onClick={handleMakePayment}
        >
          {paymentLoading ? "Processing..." : "Make Payment"}
        </button>
      </div>
    </div>
  );
}
