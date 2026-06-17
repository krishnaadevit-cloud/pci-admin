"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFullRegistration } from "@/store/selectors";
import {
  fetchApplicationPreview,
  fetchApplicationTypesData,
  selectApplicationTypeByName,
  selectApplicationTypes,
  selectDashboardData,
  selectPreviewData,
  selectPreviewLoading,
} from "@/store/slices";
import {
  formatDobPreview,
  formatMonthYearPreview,
  type AddressState,
  type DocumentRowState,
} from "./registrationState";
import PrtsRegistrationAccordionSection from "./forms/PrtsRegistrationAccordionSection";
import PreviewAccordionSection from "./forms/PreviewAccordionSection";
import PaymentConfirmDialog from "./PaymentConfirmDialog";
import { postData as paymentPostData } from "@/service/Payment_Service";
import { CREATE_PAYMENT_ORDER, CREATE_ORDER } from "@/config/ApiConstant";
import { loadUser } from "@/lib/auth/cookieStorage";

interface FeeItem {
  label: string;
  value: number;
}

interface ApplicationPreviewProps {
  onBack: () => void;
  onMakePayment: () => void;
}

function PreviewSkeleton() {
  const panels = [
    { cols: 10 }, // Personal Details: 10 fields
    { cols: 8 },  // Education Details: 8 fields
    { cols: 4 },  // Communication: 4 fields
    { cols: 4 },  // Documents: 4 fields
  ];

  return (
    <div className="prts-application-preview">
      <div className="prts-application-preview__header">
        <div>
          <span className="prts-preview-skel prts-preview-skel--title" />
          <span className="prts-preview-skel prts-preview-skel--subtitle" />
        </div>
        <span className="prts-preview-skel prts-preview-skel--id-box" />
      </div>

      {panels.map((panel, i) => (
        <div key={i} className="prts-preview-skeleton__panel">
          <div className="prts-preview-skeleton__panel-header">
            <span className="prts-preview-skel prts-preview-skel--panel-title" />
            <span className="prts-preview-skel prts-preview-skel--chevron" />
          </div>
          <div className="prts-preview-skeleton__grid">
            {Array.from({ length: panel.cols }).map((_, j) => (
              <div key={j} className="prts-preview-skeleton__field">
                <span className="prts-preview-skel prts-preview-skel--label" />
                <span className="prts-preview-skel prts-preview-skel--value" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="prts-application-preview__footer">
        <span className="prts-preview-skel prts-preview-skel--btn" />
        <span className="prts-preview-skel prts-preview-skel--btn" />
      </div>
    </div>
  );
}

function PreviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="prts-preview-field">
      <span className="prts-preview-field__label">{label}</span>
      <span className="prts-preview-field__value">{value || "—"}</span>
    </div>
  );
}

function AddressBlock({ title, data }: { title: string; data: AddressState }) {
  return (
    <div className="prts-preview-address-block">
      <PreviewAccordionSection title={title}>
        <div className="prts-preview-address-block__address">
          <PreviewField label="Address" value={data.address} />
        </div>
        <div className="prts-preview-grid prts-preview-grid--5">
          <PreviewField label="Pincode" value={data.pinCode} />
          <PreviewField label="State" value={data.state} />
          <PreviewField label="District" value={data.district} />
          <PreviewField label="City" value={data.city} />
        </div>
      </PreviewAccordionSection>
    </div>
  );
}

function PreviewDocumentsTable({
  documents,
}: {
  documents: DocumentRowState[];
}) {
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
                className={
                  row.status === "uploaded" ? "prts-doc-row--success" : ""
                }
              >
                <td className="prts-html-table__col-check">
                  <input
                    type="checkbox"
                    checked={row.status === "uploaded"}
                    disabled
                    readOnly
                    className={`prts-table-checkbox ${row.status === "uploaded"
                      ? "prts-table-checkbox--success"
                      : ""
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
                        <div className="prts-doc-cell__file-info">
                          {/* <span className="prts-doc-cell__file-name">
                            {row.fileName}
                          </span> */}
                          {/* <span className="prts-doc-cell__file-meta prts-doc-cell__file-meta--success">
                            {row.fileSize ?? ""}
                          </span> */}
                        </div>
                      </div>
                      {/* <div className="prts-doc-cell__actions">
                        <button
                          type="button"
                          className="prts-doc-cell__icon-btn"
                          aria-label={`View ${row.fileName}`}
                          onClick={() => viewFile(row)}
                        >
                          <Image
                            src="/assets/fresh-registration/view.svg"
                            alt="View"
                            width={30}
                            height={30}
                          />
                        </button>
                      </div> */}
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

export default function ApplicationPreview({
  onBack,
  onMakePayment,
}: ApplicationPreviewProps) {
  const dispatch = useAppDispatch();
  const registration = useAppSelector(selectFullRegistration);
  const dashboardData = useAppSelector(selectDashboardData);
  const previewData = useAppSelector(selectPreviewData);
  const previewLoading = useAppSelector(selectPreviewLoading);

  const toast = useRef<Toast>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [feeStructure, setFeeStructure] = useState<FeeItem[]>([]);
  const [feeTotal, setFeeTotal] = useState(0);

  const applicationTypes = useAppSelector(selectApplicationTypes);
  const freshApplicationType = useAppSelector(selectApplicationTypeByName("Fresh Registration"));


  useEffect(() => {
    const appUuid =
      registration.applicationId ||
      (dashboardData as any)?.fresh_application_uuid ||
      "";
    dispatch(fetchApplicationPreview(appUuid));
  }, []);

  useEffect(() => {
    if (applicationTypes.length === 0) {
      dispatch(fetchApplicationTypesData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const display = previewData ?? registration;
  const {
    applicationId,
    personal,
    education,
    additionalQualifications,
    communication,
    educationDocuments,
    documents,
  } = display;

  if (previewLoading) {
    return <PreviewSkeleton />;
  }

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
          <h1 className="prts-application-preview__title">
            Application Preview
          </h1>
          <p className="prts-application-preview__subtitle">
            Review all details before proceeding to payment.
          </p>
        </div>
        <div className="prts-application-preview__id">
          <span className="prts-application-preview__id-label">
            Application ID:
          </span>
          <span className="prts-application-preview__id-value">
            {applicationId}
          </span>
        </div>
      </div>

      <div className="prts-personal-accordion-group">
        <PrtsRegistrationAccordionSection
          title="Personal Details"
          sectionClassName="prts-preview-panel__body"
        >
          <PreviewAccordionSection title="Personal Details">
            <div className="prts-preview-grid prts-preview-grid--4">
              <PreviewField label="Full Name" value={personal.fullName} />
              <PreviewField label="Gender" value={personal.gender} />
              <PreviewField
                label="Date of Birth"
                value={formatDobPreview(personal.dob)}
              />
              <PreviewField label="Birth Place" value={personal.birthPlace} />
              <PreviewField label="Blood Group" value={personal.bloodGroup} />
              <PreviewField label="Nationality" value={personal.nationality} />
              <PreviewField label="Religion" value={personal.religion} />
              <PreviewField label="Category" value={personal.category} />
            </div>
          </PreviewAccordionSection>

          <PreviewAccordionSection title="Contact Details">
            <div className="prts-preview-grid prts-preview-grid--3">
              <PreviewField label="Mobile No." value={personal.mobile} />
              <PreviewField
                label="Alternate Mobile"
                value={personal.altMobile}
              />
              <PreviewField label="Email Address" value={personal.email} />
            </div>
          </PreviewAccordionSection>
        </PrtsRegistrationAccordionSection>

        <PrtsRegistrationAccordionSection
          title="Education Details"
          sectionClassName="prts-preview-panel__body"
        >
          <PreviewAccordionSection title="Education Details">
            <p className="prts-preview-subsection__hint">SSC</p>
            <div className="prts-preview-grid prts-preview-grid--3">
              <PreviewField label="School Name" value={education.sscSchool} />
              <PreviewField label="Board" value={education.sscBoard} />
              <PreviewField
                label="Month / Year"
                value={formatMonthYearPreview(education.sscYear)}
              />
            </div>
            <hr style={{ border: "1px solid #e5e5e5" }} />
            <p className="prts-preview-subsection__hint">HSC</p>
            <div className="prts-preview-grid prts-preview-grid--3">
              <PreviewField label="School Name" value={education.hscSchool} />
              <PreviewField label="Board" value={education.hscBoard} />
              <PreviewField
                label="Month / Year"
                value={formatMonthYearPreview(education.hscYear)}
              />
            </div>
          </PreviewAccordionSection>

          <PreviewAccordionSection title="Registrable Qualification">
            <div className="prts-preview-grid prts-preview-grid--4">
              <PreviewField
                label="Qualification"
                value={education.qualification}
              />
              <PreviewField
                label="Institute Code"
                value={education.institutionCode}
              />
              <PreviewField
                label="College / Institute Name"
                value={education.college}
              />
            </div>
            <div className="prts-preview-grid prts-preview-grid--4">
              <PreviewField
                label="Joined Year"
                value={formatMonthYearPreview(education.joiningYear)}
              />
              <PreviewField
                label="Passed Year"
                value={formatMonthYearPreview(education.passedYear)}
              />
              <PreviewField
                label="Hospital Internship"
                value={education.hospital}
              />
            </div>

            <div className="prts-preview-sub-accordion__header">
              <span className="prts-preview-sub-accordion__title">{education.qualification
                ? `${education.qualification} Documents`
                : "Educational Documents"}</span>
            </div>
            <PreviewDocumentsTable documents={educationDocuments} />
          </PreviewAccordionSection>



          {additionalQualifications.some(
            (q) => q.qualification || q.college,
          ) && (
              <PreviewAccordionSection title="Additional Qualification">
                {additionalQualifications.map(
                  (q) =>
                    (q.qualification || q.college) && (
                      <div
                        key={q.id}
                        className="prts-preview-grid prts-preview-grid--4 prts-preview-subsection__row"
                      >
                        <PreviewField
                          label="Qualification"
                          value={q.qualification ?? ""}
                        />
                        <PreviewField
                          label="Institute Code"
                          value={q.institutionCode ?? ""}
                        />
                        <PreviewField
                          label="College / Institute Name"
                          value={q.college ?? ""}
                        />
                      </div>
                    ),
                )}
              </PreviewAccordionSection>
            )}
        </PrtsRegistrationAccordionSection>

        <PrtsRegistrationAccordionSection
          title="Communication Details"
          sectionClassName="prts-preview-panel__body"
        >
          <AddressBlock
            title="Permanent Address"
            data={communication.permanent}
          />
          <AddressBlock
            title="Correspondence Address"
            data={communication.correspondence}
          />
          <AddressBlock
            title="Professional Address"
            data={communication.professional}
          />
        </PrtsRegistrationAccordionSection>

        <PrtsRegistrationAccordionSection
          title="Documents"
          sectionClassName="prts-preview-panel__body"
        >
          <PreviewDocumentsTable documents={documents} />
        </PrtsRegistrationAccordionSection>
      </div>

      <div className="prts-application-preview__footer">
        <button
          type="button"
          className="prts-btn prts-btn--outline"
          onClick={onBack}
        >
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
