"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { Calendar } from "primereact/calendar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectDashboardData,
  selectApplicationTypeByName,
  selectApplicationTypes,
  fetchApplicationTypesData,
  submitRenewalApplication,
} from "@/store/slices";
import PharmacyDropdown, {
  PharmacyDropdownOption,
} from "@/app/(full-page)/pharmacy/components/PharmacyDropdown";
import DocumentUploadTable from "@/app/(full-page)/pharmacy/fresh-registration/DocumentUploadTable";
import {
  fetchQualifications,
  fetchQualificationDegrees,
  fetchCollegeByPciCode,
  fetchHospitals,
} from "@/services/educationService";
import { validatePdfFile } from "@/app/(full-page)/pharmacy/fresh-registration/pdfValidation";
import { loadUser } from "@/lib/auth/cookieStorage";
import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";
import type { QualForm } from "../constants";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseYearMonth(val: string | null | undefined): Date | null {
  if (!val) return null;
  if (/^\d{4}-\d{2}$/.test(val)) {
    const [y, m] = val.split("-").map(Number);
    if (!y || !m) return null;
    return new Date(y, m - 1, 1);
  }
  const parts = val.trim().split(/\s+/);
  if (parts.length === 2) {
    const monthIdx = MONTH_NAMES.findIndex(
      (n) => n.toLowerCase() === parts[0].toLowerCase(),
    );
    const year = parseInt(parts[1], 10);
    if (monthIdx !== -1 && !isNaN(year)) return new Date(year, monthIdx, 1);
  }
  return null;
}

function formatYearMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function toMonthYear(val: string | null | undefined): string {
  if (!val) return "";
  if (/^\d{4}-\d{2}/.test(val)) {
    const [y, m] = val.split("-").map(Number);
    if (y && m >= 1 && m <= 12) return `${MONTH_NAMES[m - 1]} ${y}`;
  }
  const spaceIdx = val.indexOf(" ");
  if (spaceIdx > 0) {
    const monthPart = val.substring(0, spaceIdx);
    const year = parseInt(val.substring(spaceIdx + 1), 10);
    const monthIdx = MONTH_NAMES.findIndex(
      (n) => n.toLowerCase() === monthPart.toLowerCase(),
    );
    if (monthIdx !== -1 && !isNaN(year) && year > 1900) {
      return `${MONTH_NAMES[monthIdx]} ${year}`;
    }
  }
  return val;
}

interface AddQualificationStepProps {
  form: QualForm;
  onUpdate: (key: keyof QualForm, value: string) => void;
  qualDocuments: DocumentRowState[];
  onQualDocumentUpdate: (id: number, patch: Partial<DocumentRowState>) => void;
  onQualDocumentsReplaced: (docs: DocumentRowState[]) => void;
  onBack: () => void;
  onContinue: () => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

export default function AddQualificationStep({
  form,
  onUpdate,
  qualDocuments,
  onQualDocumentUpdate,
  onQualDocumentsReplaced,
  onBack,
  onContinue,
  onScrollToTop,
}: AddQualificationStepProps) {
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const applicationTypes = useAppSelector(selectApplicationTypes);
  const addQualApplicationType = useAppSelector(selectApplicationTypeByName("Add Qualification"));

  const toast = useRef<Toast>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [qualificationOptions, setQualificationOptions] = useState<PharmacyDropdownOption[]>([]);
  const [loadingQualifications, setLoadingQualifications] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [collegeOptions, setCollegeOptions] = useState<PharmacyDropdownOption[]>([]);
  const [rawColleges, setRawColleges] = useState<any[]>([]);
  const [loadingCollege, setLoadingCollege] = useState(false);
  const [hospitalOptions, setHospitalOptions] = useState<PharmacyDropdownOption[]>([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (applicationTypes.length === 0) {
      dispatch(fetchApplicationTypesData());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When qualification options load and form already has a pre-filled qualificationId
  // (from dashboard prefill), auto-populate the display name
  useEffect(() => {
    if (!form.qualificationId || form.qualification || qualificationOptions.length === 0) return;
    const found = qualificationOptions.find((o) => o.value === form.qualificationId);
    if (found) onUpdate("qualification", found.label);
  }, [form.qualificationId, form.qualification, qualificationOptions]);

  useEffect(() => {
    setLoadingQualifications(true);
    fetchQualifications()
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : [];
        setQualificationOptions(
          list.map((q) => ({ label: q.qualificationName, value: q.uuid })),
        );
      })
      .catch(() => {})
      .finally(() => setLoadingQualifications(false));

    setLoadingHospitals(true);
    fetchHospitals()
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : [];
        setHospitalOptions(
          list.map((h) => ({ label: h.hospitalName ?? h.name ?? h.hospital_name, value: h.uuid })),
        );
      })
      .catch(() => {})
      .finally(() => setLoadingHospitals(false));
  }, []);

  useEffect(() => {
    if (!form.institutionCode?.trim()) return;
    if (form.college && form.collegeId) {
      setCollegeOptions([{ label: form.college, value: form.collegeId }]);
    }
    fetchCollegeByPciCode(form.institutionCode.trim())
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : data ? [data] : [];
        setRawColleges(list);
        setCollegeOptions(list.map((c) => ({ label: c.collegeName, value: c.uuid })));
      })
      .catch(() => {});
  }, []);

  const handleQualificationChange = (qualificationId: string | null) => {
    const selected = qualificationOptions.find((q) => q.value === qualificationId);
    onUpdate("qualificationId", qualificationId ?? "");
    onUpdate("qualification", selected?.label ?? "");
    clearError("qualification");

    if (!qualificationId) {
      onQualDocumentsReplaced([]);
      return;
    }

    setLoadingDocuments(true);
    fetchQualificationDegrees(qualificationId)
      .then((data: any) => {
        const rawDocs: any[] = Array.isArray(data) ? data : (data?.documents ?? []);
        const mapped: DocumentRowState[] = rawDocs.map((doc: any, idx: number) => ({
          id: doc.id ?? idx + 1,
          uuid: doc.uuid,
          name: doc.documentName ?? `Document ${idx + 1}`,
          status: "pending",
          isRequired: doc.isRequired ?? true,
          digiFetchDisabled: false,
          selected: false,
        }));
        onQualDocumentsReplaced(mapped);
      })
      .catch(() => {})
      .finally(() => setLoadingDocuments(false));
  };

  const handleInstitutionCodeChange = (code: string) => {
    onUpdate("institutionCode", code);
    onUpdate("college", "");
    onUpdate("collegeId", "");
    setCollegeOptions([]);
    clearError("institutionCode");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!code.trim()) return;

    debounceRef.current = setTimeout(() => {
      setLoadingCollege(true);
      fetchCollegeByPciCode(code.trim())
        .then((data: any) => {
          const list: any[] = Array.isArray(data) ? data : data ? [data] : [];
          setRawColleges(list);
          setCollegeOptions(list.map((c) => ({ label: c.collegeName, value: c.uuid })));
        })
        .catch(() => {})
        .finally(() => setLoadingCollege(false));
    }, 500);
  };

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleDocumentUpdate = useCallback((id: number, patch: Partial<DocumentRowState>) => {
    onQualDocumentUpdate(id, patch);
    setErrors((prev) => {
      if (!prev.qualDocuments) return prev;
      const next = { ...prev };
      delete next.qualDocuments;
      return next;
    });
  }, [onQualDocumentUpdate]);

  const handleContinue = useCallback(async () => {
    // 1. Client-side validation
    const newErrors: Record<string, string> = {};
    if (!form.qualificationId) newErrors.qualification = "Please select a qualification.";
    if (!form.institutionCode.trim()) newErrors.institutionCode = "Institution code is required.";
    if (!form.collegeId) newErrors.college = "Please select a college / institute.";
    if (!form.joiningYear) newErrors.joiningYear = "Joining year is required.";
    if (!form.passedYear) newErrors.passedYear = "Passed year is required.";
    if (!form.hospital) newErrors.hospital = "Please select a hospital / internship.";

    const missingDocs = qualDocuments.filter((d) => d.isRequired && d.status !== "uploaded");
    if (missingDocs.length > 0) {
      newErrors.qualDocuments = `Please upload all required documents (${missingDocs.length} remaining).`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      onScrollToTop?.();
      if (newErrors.qualDocuments) {
        toast.current?.show({
          severity: "error",
          summary: "Validation Error",
          detail: newErrors.qualDocuments,
          life: 5000,
        });
      }
      return;
    }
    setErrors({});

    // 2. Call API
    setIsLoading(true);
    try {
      const authUser = loadUser();
      const newlyUploadedDocs = qualDocuments.filter((doc) => !!doc.fileObject);

      const degreeAdditionDetails = {
        new_qualification_uuid: form.qualificationId,
        institute_pci_code: form.institutionCode,
        college_name: form.college,
        joining_year: toMonthYear(form.joiningYear),
        passing_year: toMonthYear(form.passedYear),
        hospital_master_uuid: form.hospital,
      };

      const formData = new FormData();
      formData.append("application_uuid", addQualApplicationType?.uuid ?? "");
      formData.append(
        "fresh_application_uuid",
        dashboardData?.fresh_application_uuid ?? "",
      );
      formData.append("user_uuid", authUser?.id ?? "");
      formData.append("is_final_submit", "false");
      formData.append("degree_addition_details", JSON.stringify(degreeAdditionDetails));
      newlyUploadedDocs.forEach((doc) => {
        formData.append(`file_${doc.id}`, doc.fileObject!, doc.fileName ?? doc.name);
      });

      const result = await dispatch(submitRenewalApplication(formData));

      if (submitRenewalApplication.fulfilled.match(result)) {
        onContinue();
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Submission Failed",
          detail:
            (result.payload as string) ??
            "Failed to save qualification details. Please try again.",
          life: 5000,
        });
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to save qualification details. Please try again.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [form, qualDocuments, onContinue, addQualApplicationType, dashboardData, dispatch, onScrollToTop]);

  const joiningParsed = parseYearMonth(form.joiningYear);
  const minPassedDate = joiningParsed
    ? new Date(joiningParsed.getFullYear(), joiningParsed.getMonth() + 1, 1)
    : undefined;

  return (
    <div className="prts-education-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />

      <div className="prts-education-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title">Add New Qualification Details</h1>
          </div>
        </div>

        <div className="prts-form-grid prts-form-grid--3-1-2 mt-4">
          <PharmacyDropdown
            label="Qualification"
            value={form.qualificationId || null}
            onChange={handleQualificationChange}
            options={qualificationOptions}
            required
            disabled={loadingQualifications}
            placeholder={
              loadingQualifications ? "Loading qualifications..." : "-- Select --"
            }
            errorMessage={errors.qualification}
          />

          <div
            className={`prts-field ${errors.institutionCode ? "prts-field--error" : ""}`}
          >
            <label className="prts-field__label">
              Institution Code<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <input
                className="prts-field__input"
                value={form.institutionCode}
                onChange={(e) => handleInstitutionCodeChange(e.target.value)}
                placeholder="Enter PCI Code"
              />
            </div>
            {errors.institutionCode && (
              <span className="prts-field__error-message">{errors.institutionCode}</span>
            )}
          </div>

          <PharmacyDropdown
            label="College / Institute Name"
            value={form.collegeId || null}
            onChange={(value) => {
              const uuid = value ?? "";
              const match = rawColleges.find((c) => c.uuid === uuid);
              onUpdate("collegeId", uuid);
              onUpdate("college", match?.collegeName ?? "");
              clearError("college");
            }}
            options={collegeOptions}
            required
            disabled={loadingCollege}
            placeholder={
              loadingCollege
                ? "Loading..."
                : form.institutionCode?.trim()
                ? "Select College / Institute"
                : "Enter Institution Code first"
            }
            errorMessage={errors.college}
          />

          <div
            className={`prts-field prts-field--date ${
              errors.joiningYear ? "prts-field--error" : ""
            }`}
          >
            <label className="prts-field__label">
              Joining Year<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper prts-calendar-wrapper">
              <Calendar
                value={parseYearMonth(form.joiningYear)}
                onChange={(e) => {
                  onUpdate(
                    "joiningYear",
                    e.value ? formatYearMonth(e.value as Date) : "",
                  );
                  clearError("joiningYear");
                }}
                view="month"
                dateFormat="MM yy"
                placeholder="Month YYYY"
                maxDate={new Date()}
                showIcon={false}
                className="prts-field__calendar"
                inputClassName="prts-field__input prts-calendar-input"
                panelClassName="prts-pharmacy-datepicker-panel"
              />
            </div>
            {errors.joiningYear && (
              <span className="prts-field__error-message">{errors.joiningYear}</span>
            )}
          </div>

          <div
            className={`prts-field prts-field--date ${
              errors.passedYear ? "prts-field--error" : ""
            }`}
          >
            <label className="prts-field__label">
              Passed Year<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper prts-calendar-wrapper">
              <Calendar
                value={parseYearMonth(form.passedYear)}
                onChange={(e) => {
                  onUpdate(
                    "passedYear",
                    e.value ? formatYearMonth(e.value as Date) : "",
                  );
                  clearError("passedYear");
                }}
                view="month"
                dateFormat="MM yy"
                placeholder="Month YYYY"
                minDate={minPassedDate}
                maxDate={new Date()}
                showIcon={false}
                className="prts-field__calendar"
                inputClassName="prts-field__input prts-calendar-input"
                panelClassName="prts-pharmacy-datepicker-panel"
              />
            </div>
            {errors.passedYear && (
              <span className="prts-field__error-message">{errors.passedYear}</span>
            )}
          </div>

          <PharmacyDropdown
            label="Hospital / Internship"
            value={form.hospital || null}
            onChange={(value) => {
              onUpdate("hospital", value ?? "");
              clearError("hospital");
            }}
            options={hospitalOptions}
            required
            disabled={loadingHospitals}
            placeholder={
              loadingHospitals ? "Loading hospitals..." : "-- Select --"
            }
            errorMessage={errors.hospital}
          />
        </div>

        {loadingDocuments && (
          <p className="prts-loading-hint">Loading qualification documents...</p>
        )}
        {form.qualificationId && !loadingDocuments && (
          <div className="prts-education-table mt-4">
            <DocumentUploadTable
              title={`Upload ${form.qualification} Documents`}
              documents={qualDocuments}
              onUpdate={handleDocumentUpdate}
              onValidate={validatePdfFile}
              onValidationError={(msg) =>
                toast.current?.show({
                  severity: "error",
                  summary: "Invalid File",
                  detail: msg,
                  life: 6000,
                })
              }
            />
            {errors.qualDocuments && (
              <p className="prts-field__error-message mt-2">{errors.qualDocuments}</p>
            )}
          </div>
        )}

        <div className="prts-form-footer__actions mt-6" style={{justifyContent:'space-between'}}>
          <button
            type="button"
            className="prts-btn prts-btn--outline"
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="button"
            className={`prts-btn prts-btn--primary${isLoading ? " prts-btn--disabled" : ""}`}
            disabled={isLoading}
            onClick={handleContinue}
          >
            {isLoading ? "Saving..." : "Continue to Document"}
          </button>
        </div>
      </div>
    </div>
  );
}
