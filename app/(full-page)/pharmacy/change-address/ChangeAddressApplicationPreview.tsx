"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDashboardData,
  selectApplicationTypeByName,
  selectApplicationTypes,
  fetchApplicationTypesData,
} from "@/store/slices";
import PrtsRegistrationAccordionSection from "@/app/(full-page)/pharmacy/fresh-registration/forms/PrtsRegistrationAccordionSection";
import { postData } from "@/service/ApplicationService";
import { PHARMACY_SAVE_ADDRESS_CHANGE } from "@/config/ApiConstant";
import { loadUser } from "@/lib/auth/cookieStorage";
import type {
  DocumentRowState,
  AddressState,
} from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";

interface ChangeAddressApplicationPreviewProps {
  newAddress: AddressState | null;
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

export default function ChangeAddressApplicationPreview({
  newAddress,
  documents,
  onBack,
}: ChangeAddressApplicationPreviewProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useRef<Toast>(null);
  const dashboardData = useAppSelector(selectDashboardData);
  const applicationTypes = useAppSelector(selectApplicationTypes);
  const changeAddressApplicationType = useAppSelector(selectApplicationTypeByName("Change In Address"));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const cd = (dashboardData?.fresh_app_details?.communicationDetails ?? {}) as Record<string, any>;

  useEffect(() => {
    if (applicationTypes.length === 0) {
      dispatch(fetchApplicationTypesData());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div className="prts-application-preview">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      <div className="prts-application-preview__header">
        <div>
          <h1 className="prts-application-preview__title">Application Preview</h1>
          <p className="prts-application-preview__subtitle">
            Review all details before submitting your application.
          </p>
        </div>
        {dashboardData?.address_change_details?.uuid && (
          <div className="prts-application-preview__id">
            <span className="prts-application-preview__id-label">Application No.:</span>
            <span className="prts-application-preview__id-value">
              {dashboardData.address_change_details.uuid}
            </span>
          </div>
        )}
      </div>

      <div className="prts-personal-accordion-group">
        <PrtsRegistrationAccordionSection
          title="Current Address"
          sectionClassName="prts-preview-panel__body"
        >
          <div className="prts-preview-grid prts-preview-grid--2">
            <PreviewField label="Permanent Address" value={cd.permanent_address ?? "—"} />
          </div>
          <div className="prts-preview-grid prts-preview-grid--4">
            <PreviewField label="Pin Code" value={cd.permanent_pin_code ?? "—"} />
            <PreviewField label="State" value={cd.permanent_state ?? "—"} />
            <PreviewField label="District" value={cd.permanent_district ?? "—"} />
            <PreviewField label="City" value={cd.permanent_city ?? "—"} />
          </div>
        </PrtsRegistrationAccordionSection>

        <PrtsRegistrationAccordionSection
          title="New Address"
          sectionClassName="prts-preview-panel__body"
        >
          <div className="prts-preview-grid prts-preview-grid--2">
            <PreviewField label="Permanent Address" value={newAddress?.address ?? "—"} />
          </div>
          <div className="prts-preview-grid prts-preview-grid--4">
            <PreviewField label="Pin Code" value={newAddress?.pinCode ?? "—"} />
            <PreviewField label="State" value={newAddress?.state ?? "—"} />
            <PreviewField label="District" value={newAddress?.district ?? "—"} />
            <PreviewField label="City" value={newAddress?.city ?? "—"} />
          </div>
        </PrtsRegistrationAccordionSection>

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
          className={`prts-btn prts-btn--primary${isSubmitting ? " prts-btn--disabled" : ""}`}
          disabled={isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
