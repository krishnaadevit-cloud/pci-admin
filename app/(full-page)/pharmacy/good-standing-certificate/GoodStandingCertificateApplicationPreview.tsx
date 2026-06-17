"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDashboardData,
  selectApplicationTypeByName,
  selectApplicationTypes,
  selectOtherApplicationUuid,
  fetchApplicationTypesData,
} from "@/store/slices";
import { postData as paymentPostData } from "@/service/Payment_Service";
import { CREATE_PAYMENT_ORDER, CREATE_ORDER } from "@/config/ApiConstant";
import { loadUser } from "@/lib/auth/cookieStorage";
import PrtsRegistrationAccordionSection from "@/app/(full-page)/pharmacy/fresh-registration/forms/PrtsRegistrationAccordionSection";
import PaymentConfirmDialog from "@/app/(full-page)/pharmacy/fresh-registration/PaymentConfirmDialog";
import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";
import type { PharmacistReference } from "./constants";

interface PharmacistReferences {
  pharmacist1: PharmacistReference;
  pharmacist2: PharmacistReference;
}

interface GoodStandingCertificateApplicationPreviewProps {
  pharmacistReferences: PharmacistReferences | null;
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

export default function GoodStandingCertificateApplicationPreview({
  pharmacistReferences,
  documents,
  onBack,
}: GoodStandingCertificateApplicationPreviewProps) {
  const dispatch = useAppDispatch();
  const toast = useRef<Toast>(null);
  const dashboardData = useAppSelector(selectDashboardData);
  const applicationTypes = useAppSelector(selectApplicationTypes);
  const goodStandingApplicationType = useAppSelector(selectApplicationTypeByName("Good Standing Certificate"));
  const otherApplicationUuid = useAppSelector(selectOtherApplicationUuid);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [feeStructure, setFeeStructure] = useState<{ label: string; value: number }[]>([]);
  const [feeTotal, setFeeTotal] = useState(0);

  useEffect(() => {
    if (applicationTypes.length === 0) {
      dispatch(fetchApplicationTypesData());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pd = (dashboardData?.fresh_app_details?.personalDetails ?? {}) as Record<string, any>;
  const cd = (dashboardData?.fresh_app_details?.communicationDetails ?? {}) as Record<string, any>;
  const ed = (dashboardData?.fresh_app_details?.educationalDetails ?? {}) as Record<string, any>;
  const dd = (dashboardData as any) ?? {};

  // Personal Details
  const fullName = (pd.fullName ?? pd.full_name ?? [pd.surname, pd.firstName, pd.middleName].filter(Boolean).join(" ")) || "—";
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

  const handleMakePayment = async () => {
    setPaymentLoading(true);
    try {
      const authUser = loadUser();
      const response = await paymentPostData(CREATE_PAYMENT_ORDER, {
        user_uuid: authUser?.id ?? "",
        applicationName: goodStandingApplicationType?.applicationName,
      });
      const data = response?.data ?? response;
      setFeeStructure(data?.fee_structure ?? []);
      setFeeTotal(data?.total ?? 0);
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
        applicationName: goodStandingApplicationType?.applicationName,
        application_uuid: otherApplicationUuid ?? "",
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

  return (
    <div className="prts-application-preview">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      <PaymentConfirmDialog
        visible={paymentDialog}
        onHide={() => setPaymentDialog(false)}
        onConfirm={handleConfirmPayment}
        feeStructure={feeStructure}
        total={feeTotal}
        loading={paymentLoading}
      />

      <div className="prts-application-preview__header">
        <div>
          <h1 className="prts-application-preview__title">Application Preview</h1>
          <p className="prts-application-preview__subtitle">
            Review all details before proceeding to payment.
          </p>
        </div>
        {otherApplicationUuid && (
          <div className="prts-application-preview__id">
            <span className="prts-application-preview__id-label">Application No.:</span>
            <span className="prts-application-preview__id-value">{otherApplicationUuid}</span>
          </div>
        )}
      </div>

      <div className="prts-personal-accordion-group">
        <PrtsRegistrationAccordionSection
          title="Personal Details"
          sectionClassName="prts-preview-panel__body"
        >
          <div className="prts-preview-grid prts-preview-grid--4">
            <PreviewField label="Full Name" value={fullName} />
            <PreviewField label="Mobile No." value={mobileNo} />
            <PreviewField label="Second Mobile No." value={secondMobileNo} />
            <PreviewField label="Email Address" value={emailAddress} />
          </div>
          <div className="prts-preview-grid prts-preview-grid--2">
            <PreviewField label="Permanent Address" value={permanentAddress} />
          </div>
        </PrtsRegistrationAccordionSection>

        <PrtsRegistrationAccordionSection
          title="Registrable Qualification"
          sectionClassName="prts-preview-panel__body"
        >
          <div className="prts-preview-grid prts-preview-grid--3">
            <PreviewField label="Qualification" value={qualification} />
            <PreviewField label="Institution Code" value={institutionCode} />
            <PreviewField label="College Name" value={collegeName} />
          </div>
          <div className="prts-preview-grid prts-preview-grid--2">
            <PreviewField label="Year of Admission" value={yearOfAdmission} />
            <PreviewField label="Year of Passing" value={yearOfPassing} />
          </div>
        </PrtsRegistrationAccordionSection>

        <PrtsRegistrationAccordionSection
          title="Registration Details"
          sectionClassName="prts-preview-panel__body"
        >
          <div className="prts-preview-grid prts-preview-grid--3">
            <PreviewField label="Pharmacist Registration No." value={registrationNo} />
            <PreviewField label="Date of Registration" value={dateOfRegistration} />
            <PreviewField label="Date of Validity" value={dateOfValidity} />
          </div>
        </PrtsRegistrationAccordionSection>

        {pharmacistReferences && (
          <PrtsRegistrationAccordionSection
            title="Pharmacist References"
            sectionClassName="prts-preview-panel__body"
          >
            <p className="prts-preview-panel__sub-title">1st Pharmacist</p>
            <div className="prts-preview-grid prts-preview-grid--3">
              <PreviewField label="Registration No." value={pharmacistReferences.pharmacist1.registrationNo} />
              <PreviewField label="Full Name" value={pharmacistReferences.pharmacist1.fullName} />
              <PreviewField label="Address" value={pharmacistReferences.pharmacist1.address} />
            </div>
            <p className="prts-preview-panel__sub-title mt-3">2nd Pharmacist</p>
            <div className="prts-preview-grid prts-preview-grid--3">
              <PreviewField label="Registration No." value={pharmacistReferences.pharmacist2.registrationNo} />
              <PreviewField label="Full Name" value={pharmacistReferences.pharmacist2.fullName} />
              <PreviewField label="Address" value={pharmacistReferences.pharmacist2.address} />
            </div>
          </PrtsRegistrationAccordionSection>
        )}

        <PrtsRegistrationAccordionSection
          title="Documents"
          sectionClassName="prts-preview-panel__body"
        >
          <PreviewDocumentsTable documents={documents} />
        </PrtsRegistrationAccordionSection>
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
