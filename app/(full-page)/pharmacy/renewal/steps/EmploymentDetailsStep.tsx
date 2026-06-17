"use client";

import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDashboardData,
  selectOtherApplicationSubmitting,
  selectOtherApplicationUuid,
  selectRenewalPeriod,
  selectApplicationTypeByName,
  selectEmploymentDetails,
  setEmploymentDetails,
  submitRenewalApplication,
} from "@/store/slices";
import { loadUser } from "@/lib/auth/cookieStorage";

const EMPLOYMENT_STATUS = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

interface FieldErrors {
  designation?: string;
  organizationName?: string;
  docFile?: string;
}

interface EmploymentDetailsStepProps {
  onBack: () => void;
  onContinue: () => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

export default function EmploymentDetailsStep({
  onBack,
  onContinue,
}: EmploymentDetailsStepProps) {
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const isSubmitting = useAppSelector(selectOtherApplicationSubmitting);
  const otherApplicationUuid = useAppSelector(selectOtherApplicationUuid);
  const renewalPeriod = useAppSelector(selectRenewalPeriod);
  const renewalApplicationType = useAppSelector(selectApplicationTypeByName("Renewal Registration"));
  const savedEmployment = useAppSelector(selectEmploymentDetails);
  const toast = useRef<Toast>(null);

  const [employmentStatus, setEmploymentStatus] = useState(savedEmployment?.employmentStatus ?? "yes");
  const [designation, setDesignation] = useState(savedEmployment?.designation ?? "");
  const [organizationName, setOrganizationName] = useState(savedEmployment?.organizationName ?? "");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!savedEmployment) return;
    setEmploymentStatus(savedEmployment.employmentStatus ?? "yes");
    setDesignation(savedEmployment.designation ?? "");
    setOrganizationName(savedEmployment.organizationName ?? "");
  }, [savedEmployment]);

  const clearError = (key: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validate = (): FieldErrors => {
    if (employmentStatus !== "yes") return {};
    const errors: FieldErrors = {};
    if (!designation.trim()) errors.designation = "Designation is required.";
    if (!organizationName.trim()) errors.organizationName = "Organization Name is required.";
    if (!docFile && !savedEmployment?.employmentFileUrl) errors.docFile = "Employment document is required.";
    return errors;
  };

  const handleContinue = async () => {
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const user = loadUser();
    const isEmployed = employmentStatus === "yes";

    const formData = new FormData();
    formData.append("application_uuid", renewalApplicationType?.uuid ?? "");
    formData.append(
      "fresh_application_uuid",
      dashboardData?.fresh_application_uuid ?? "",
    );
    formData.append("user_uuid", user?.id ?? "");
    formData.append("other_application_uuid", otherApplicationUuid ?? "");
    formData.append(
      "renewal_details",
      JSON.stringify(
        isEmployed
          ? {
              renewal_period: renewalPeriod,
              employment_status: 1,
              designation,
              organization_name: organizationName,
            }
          : { employment_status: 0 },
      ),
    );
    if (isEmployed && docFile) {
      formData.append("employment_file", docFile, docFile.name);
    }

    const result = await dispatch(submitRenewalApplication(formData));

    if (submitRenewalApplication.fulfilled.match(result)) {
      const responseData = result.payload?.data ?? result.payload;
      const fileUrl = responseData?.renewal_details?.employmentFileUrl ?? "";
      dispatch(setEmploymentDetails({
        employmentStatus: isEmployed ? "yes" : "no",
        designation: isEmployed ? designation : "",
        organizationName: isEmployed ? organizationName : "",
        employmentFileUrl: fileUrl,
      }));
      onContinue();
    } else {
      toast.current?.show({
        severity: "error",
        summary: "Submission Failed",
        detail:
          (result.payload as string) ??
          "Failed to save employment details. Please try again.",
        life: 5000,
      });
    }
  };

  return (
    <div className="prts-personal-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      <div className="prts-personal-form-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title">Employment Details</h1>
          </div>
        </div>

        {/* Employment Status */}
        <div className="prts-renewal-period-section">
          <span className="prts-renewal-period-section__label">
            Employment Status:
            <span className="prts-required-asterisk">*</span>
          </span>
          <div className="prts-renewal-period-section__options">
            {EMPLOYMENT_STATUS.map((option) => (
              <label
                key={option.value}
                htmlFor={`emp-status-${option.value}`}
                className="prts-renewal-period-section__option"
              >
                <input
                  type="radio"
                  id={`emp-status-${option.value}`}
                  name="employmentStatus"
                  value={option.value}
                  checked={employmentStatus === option.value}
                  onChange={() => {
                    setEmploymentStatus(option.value);
                    setFieldErrors({});
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Employment Information */}
        {employmentStatus === "yes" && (
          <div className="prts-employment-info-section">
            <div className="prts-employment-info-section__fields">
              <div className={`prts-field${fieldErrors.designation ? " prts-field--error" : ""}`}>
                <label className="prts-field__label">
                  Designation<span className="prts-field__required">*</span>
                </label>
                <div className="prts-field__wrapper">
                  <input
                    type="text"
                    className="prts-field__input"
                    placeholder="Enter designation"
                    value={designation}
                    onChange={(e) => {
                      setDesignation(e.target.value);
                      clearError("designation");
                    }}
                  />
                </div>
                {fieldErrors.designation && (
                  <span className="prts-field__error-message">{fieldErrors.designation}</span>
                )}
              </div>
              <div className={`prts-field${fieldErrors.organizationName ? " prts-field--error" : ""}`}>
                <label className="prts-field__label">
                  Organization Name<span className="prts-field__required">*</span>
                </label>
                <div className="prts-field__wrapper">
                  <input
                    type="text"
                    className="prts-field__input"
                    placeholder="Enter organization name"
                    value={organizationName}
                    onChange={(e) => {
                      setOrganizationName(e.target.value);
                      clearError("organizationName");
                    }}
                  />
                </div>
                {fieldErrors.organizationName && (
                  <span className="prts-field__error-message">{fieldErrors.organizationName}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Document Upload */}
        {employmentStatus === "yes" && (
          <div className="prts-employment-doc-section">
            <div className={`prts-field${fieldErrors.docFile ? " prts-field--error" : ""}`}>
              <label className="prts-field__label">
                Upload Employment Document (Employment Letter &amp; ID Card)
                <span className="prts-field__required">*</span>
              </label>
              <div
                className={`prts-employment-doc-upload${fieldErrors.docFile ? " prts-employment-doc-upload--error" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    setDocFile(e.target.files?.[0] ?? null);
                    clearError("docFile");
                  }}
                />
                {docFile ? (
                  <span className="prts-employment-doc-upload__filename">
                    {docFile.name}
                  </span>
                ) : savedEmployment?.employmentFileUrl ? (
                  <span className="prts-employment-doc-upload__filename">
                    {savedEmployment.employmentFileUrl.split("/").pop()}
                  </span>
                ) : (
                  <div className="prts-employment-doc-upload__placeholder">
                    <span className="prts-employment-doc-upload__icon">
                      <i className="pi pi-upload" />
                    </span>
                    <span className="prts-employment-doc-upload__text">
                      Upload File
                    </span>
                  </div>
                )}
              </div>
              {fieldErrors.docFile && (
                <span className="prts-field__error-message">{fieldErrors.docFile}</span>
              )}
            </div>
          </div>
        )}

        <div className="prts-form-footer__actions mt-3">
          <button
            type="button"
            className="prts-btn prts-btn--outline"
            onClick={onBack}
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="button"
            className={`prts-btn prts-btn--primary${isSubmitting ? " prts-btn--disabled" : ""}`}
            disabled={isSubmitting}
            onClick={handleContinue}
          >
            {isSubmitting ? "Submitting..." : "Continue to Document Verification"}
          </button>
        </div>
      </div>
    </div>
  );
}
