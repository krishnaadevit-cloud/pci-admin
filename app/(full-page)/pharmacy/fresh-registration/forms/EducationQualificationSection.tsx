"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar } from "primereact/calendar";
import { DocumentRowState, EducationState } from "../registrationState";
import PrtsRegistrationAccordionSection from "./PrtsRegistrationAccordionSection";
import PharmacyDropdown, { PharmacyDropdownOption } from "../../components/PharmacyDropdown";
import DocumentUploadTable from "../DocumentUploadTable";
import {
  fetchQualifications,
  fetchQualificationDegrees,
  fetchCollegeByPciCode,
} from "@/services/educationService";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function parseYearMonth(val: Date | string | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;

  // "YYYY-MM" format stored internally
  if (/^\d{4}-\d{2}$/.test(val)) {
    const [y, m] = val.split("-").map(Number);
    if (!y || !m) return null;
    return new Date(y, m - 1, 1);
  }

  // "Month YYYY" format returned by API (e.g. "July 2010")
  const parts = val.trim().split(/\s+/);
  if (parts.length === 2) {
    const monthIdx = MONTH_NAMES.findIndex((n) => n.toLowerCase() === parts[0].toLowerCase());
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

interface EducationQualificationSectionProps {
  form: EducationState;
  errors: Record<string, string>;
  onUpdate: (key: keyof EducationState, value: string) => void;
  hospitalOptions: PharmacyDropdownOption[];
  loadingHospitals?: boolean;
  documents: DocumentRowState[];
  onDocumentUpdate: (id: number, patch: Partial<DocumentRowState>) => void;
  onDocumentValidate?: (file: File) => Promise<string | null>;
  onDocumentValidationError?: (message: string) => void;
  onDocumentsReplaced: (docs: DocumentRowState[]) => void;
}

export default function EducationQualificationSection({
  form,
  errors,
  onUpdate,
  hospitalOptions,
  loadingHospitals,
  documents,
  onDocumentUpdate,
  onDocumentValidate,
  onDocumentValidationError,
  onDocumentsReplaced,
}: EducationQualificationSectionProps) {
  const [qualificationOptions, setQualificationOptions] = useState<PharmacyDropdownOption[]>([]);
  const [loadingQualifications, setLoadingQualifications] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingCollege, setLoadingCollege] = useState(false);
  const [collegeOptions, setCollegeOptions] = useState<PharmacyDropdownOption[]>([]);
  const [rawColleges, setRawColleges] = useState<any[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLoadingQualifications(true);
    fetchQualifications()
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : [];
        console.log(list, 'list')
        setQualificationOptions(list.map((q) => ({ label: q.qualificationName, value: q.uuid })));
      })
      .catch(() => { })
      .finally(() => setLoadingQualifications(false));
  }, []);

  const handleQualificationChange = (qualificationId: string | null) => {
    const selected = qualificationOptions.find((q) => q.value === qualificationId);
    onUpdate("qualificationId", qualificationId ?? "");
    onUpdate("qualification", selected?.label ?? "");

    if (!qualificationId) {
      onDocumentsReplaced([]);
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
        onDocumentsReplaced(mapped);
      })
      .catch(() => { })
      .finally(() => setLoadingDocuments(false));
  };

  useEffect(() => {
    if (!form.institutionCode?.trim()) return;

    if (form.college && form.collegeId) {
      setCollegeOptions([{ label: form.college, value: form.collegeId }]);
    }

    setLoadingCollege(true);
    fetchCollegeByPciCode(form.institutionCode.trim())
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : data ? [data] : [];
        setRawColleges(list);
        setCollegeOptions(list.map((c) => ({ label: c.collegeName, value: c.uuid })));
      })
      .catch(() => {})
      .finally(() => setLoadingCollege(false));
  }, []);

  const handleInstitutionCodeChange = (code: string) => {
    onUpdate("institutionCode", code);
    onUpdate("college", "");
    onUpdate("collegeId", "");
    setCollegeOptions([]);

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
        .catch(() => { })
        .finally(() => setLoadingCollege(false));
    }, 500);
  };

  const hscParsed = parseYearMonth(form.hscYear);
  const minJoiningDate = hscParsed ? new Date(hscParsed.getFullYear(), hscParsed.getMonth() + 1, 1) : undefined;

  const joiningParsed = parseYearMonth(form.joiningYear);
  const minPassedDate = joiningParsed ? new Date(joiningParsed.getFullYear(), joiningParsed.getMonth() + 1, 1) : undefined;

  return (
    <PrtsRegistrationAccordionSection title="Registrable Qualification">
      <div className="prts-form-grid prts-form-grid--3-1-2">
        <PharmacyDropdown
          label="Qualification"
          value={form.qualificationId || null}
          onChange={handleQualificationChange}
          options={qualificationOptions}
          required
          disabled={loadingQualifications}
          placeholder={loadingQualifications ? "Loading qualifications..." : "-- Select --"}
          errorMessage={errors.qualification}
        />
        <div className={`prts-field ${errors.institutionCode ? "prts-field--error" : ""}`}>
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
          }}
          options={collegeOptions}
          required
          disabled={loadingCollege}
          placeholder={loadingCollege ? "Loading..." : form.institutionCode?.trim() ? "Select College / Institute" : "Enter Institution Code first"}
          errorMessage={errors.college}
        />
        <div className={`prts-field prts-field--date ${errors.joiningYear ? "prts-field--error" : ""}`}>
          <label className="prts-field__label">
            Joining Year<span className="prts-field__required">*</span>
          </label>
          <div className="prts-field__wrapper prts-calendar-wrapper">
            <Calendar
              value={parseYearMonth(form.joiningYear)}
              onChange={(e) => onUpdate("joiningYear", e.value ? formatYearMonth(e.value as Date) : "")}
              view="month"
              dateFormat="MM yy"
              placeholder="Month YYYY"
              minDate={minJoiningDate}
              maxDate={new Date()}
              showIcon={false}
              className="prts-field__calendar"
              inputClassName="prts-field__input prts-calendar-input"
              panelClassName="prts-pharmacy-datepicker-panel"
            />
          </div>
          {errors.joiningYear && <span className="prts-field__error-message">{errors.joiningYear}</span>}
        </div>
        <div className={`prts-field prts-field--date ${errors.passedYear ? "prts-field--error" : ""}`}>
          <label className="prts-field__label">
            Passed Year<span className="prts-field__required">*</span>
          </label>
          <div className="prts-field__wrapper prts-calendar-wrapper">
            <Calendar
              value={parseYearMonth(form.passedYear)}
              onChange={(e) => onUpdate("passedYear", e.value ? formatYearMonth(e.value as Date) : "")}
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
          {errors.passedYear && <span className="prts-field__error-message">{errors.passedYear}</span>}
        </div>
        <PharmacyDropdown
          label="Hospital / Internship"
          value={form.hospital || null}
          onChange={(value) => onUpdate("hospital", value ?? "")}
          options={hospitalOptions}
          required
          disabled={loadingHospitals}
          placeholder={loadingHospitals ? "Loading hospitals..." : "-- Select --"}
          errorMessage={errors.hospital}
        />
      </div>

      {loadingDocuments && (
        <p className="prts-loading-hint">Loading qualification documents...</p>
      )}
      {form.qualificationId && !loadingDocuments && (
        <div className="prts-education-table">
          <DocumentUploadTable
            title={`Upload ${form.qualification} Documents`}
            documents={documents}
            onUpdate={onDocumentUpdate}
            onValidate={onDocumentValidate}
            onValidationError={onDocumentValidationError}
          />
        </div>
      )}
    </PrtsRegistrationAccordionSection>
  );
}
