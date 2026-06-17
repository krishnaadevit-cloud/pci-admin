"use client";

import { useEffect, useRef, useState } from "react";
import { AdditionalQualificationState } from "../registrationState";
import PrtsRegistrationAccordionSection from "./PrtsRegistrationAccordionSection";
import PharmacyDropdown, { PharmacyDropdownOption } from "../../components/PharmacyDropdown";
import {
  fetchQualifications,
  fetchCollegeByPciCode,
} from "@/services/educationService";

type AdditionalPatch = Partial<Omit<AdditionalQualificationState, "id">>;

interface AdditionalQualificationCardProps {
  item: AdditionalQualificationState;
  index: number;
  qualificationOptions: PharmacyDropdownOption[];
  excludeIds: string[];
  onRemove: (id: number) => void;
  onUpdate: (id: number, patch: AdditionalPatch) => void;
  externalErrors?: Record<string, string>;
  onClearExternalError?: (field: string) => void;
}

function AdditionalQualificationCard({
  item,
  index,
  qualificationOptions,
  excludeIds,
  onRemove,
  onUpdate,
  externalErrors = {},
  onClearExternalError,
}: AdditionalQualificationCardProps) {
  const [loadingCollege, setLoadingCollege] = useState(false);
  const [collegeOptions, setCollegeOptions] = useState<PharmacyDropdownOption[]>(
    item.college && item.collegeId ? [{ label: item.college, value: item.collegeId }] : []
  );
  const [rawColleges, setRawColleges] = useState<any[]>([]);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mergedErrors = { ...externalErrors, ...cardErrors };

  useEffect(() => {
    if (!item.institutionCode?.trim()) return;
    setLoadingCollege(true);
    fetchCollegeByPciCode(item.institutionCode.trim())
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : data ? [data] : [];
        setRawColleges(list);
        setCollegeOptions(list.map((c) => ({ label: c.collegeName, value: c.uuid })));
      })
      .catch(() => {})
      .finally(() => setLoadingCollege(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the current card's own pre-selected value even if it matches an excludeId
  // (e.g. when main and additional share the same UUID from the server)
  const filteredOptions = qualificationOptions.filter(
    (q) => !excludeIds.includes(q.value) || q.value === item.qualificationId,
  );
  // While qualificationOptions is still loading, inject a temporary option so the
  // dropdown can display the pre-filled label instead of showing blank
  const effectiveQualificationOptions =
    item.qualificationId &&
    item.qualification &&
    !filteredOptions.some((q) => q.value === item.qualificationId)
      ? [{ label: item.qualification, value: item.qualificationId }, ...filteredOptions]
      : filteredOptions;
  const qualificationSelected = !!item.qualificationId;

  const handleQualificationChange = (qualificationId: string | null) => {
    const selected = qualificationOptions.find(
      (q) => q.value === qualificationId,
    );
    onUpdate(item.id, {
      qualificationId,
      qualification: selected?.label ?? null,
      ...(!qualificationId && { institutionCode: null, college: null, collegeId: null }),
    });
    setCardErrors({});
    onClearExternalError?.("institutionCode");
    onClearExternalError?.("college");
    if (!qualificationId) {
      setCollegeOptions([]);
      setRawColleges([]);
    }
  };

  const handleInstitutionCodeChange = (code: string) => {
    onUpdate(item.id, {
      institutionCode: code,
      college: null,
      collegeId: null,
    });
    setCollegeOptions([]);
    setRawColleges([]);
    if (cardErrors.institutionCode) {
      setCardErrors((prev) => { const next = { ...prev }; delete next.institutionCode; return next; });
    }
    onClearExternalError?.("institutionCode");

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

  const handleInstitutionCodeBlur = () => {
    if (qualificationSelected && !item.institutionCode?.trim()) {
      setCardErrors((prev) => ({ ...prev, institutionCode: "Institution code is required" }));
    }
  };

  const handleCollegeChange = (value: string | null) => {
    const uuid = value ?? null;
    const match = rawColleges.find((c) => c.uuid === uuid);
    onUpdate(item.id, { collegeId: uuid, college: match?.collegeName ?? null });
    if (uuid) {
      if (cardErrors.college) setCardErrors((prev) => { const next = { ...prev }; delete next.college; return next; });
      onClearExternalError?.("college");
    } else if (qualificationSelected) {
      setCardErrors((prev) => ({ ...prev, college: "College / Institute Name is required" }));
    }
  };

  return (
    <div className="prts-additional-card">
      <span
        className="prts-additional-card__title"
        style={{ display: "block", marginBottom: "1rem" }}
      >
        Qualification {index + 1}
      </span>
      <div className="prts-form-grid prts-form-grid--3-1-2-action">
        <PharmacyDropdown
          label="Qualification"
          value={item.qualificationId}
          onChange={handleQualificationChange}
          options={effectiveQualificationOptions}
          required={false}
          showClearButton
          filter
        />
        <div className={`prts-field ${mergedErrors.institutionCode ? "prts-field--error" : ""}`}>
          <label className="prts-field__label">
            Institution Code
            {qualificationSelected && <span className="prts-field__required">*</span>}
          </label>
          <div className="prts-field__wrapper">
            <input
              className="prts-field__input"
              value={item.institutionCode ?? ""}
              onChange={(e) => handleInstitutionCodeChange(e.target.value)}
              onBlur={handleInstitutionCodeBlur}
              placeholder="Enter PCI Code"
            />
          </div>
          {mergedErrors.institutionCode && (
            <span className="prts-field__error-message">{mergedErrors.institutionCode}</span>
          )}
        </div>
        <PharmacyDropdown
          label="College / Institute Name"
          value={item.collegeId}
          onChange={handleCollegeChange}
          options={collegeOptions}
          required={qualificationSelected}
          disabled={loadingCollege}
          placeholder={loadingCollege ? "Loading..." : item.institutionCode?.trim() ? "Select College / Institute" : "Enter Institution Code first"}
          errorMessage={mergedErrors.college}
        />
        <div style={{ display: "flex", alignItems: "center", paddingBottom: "2px" }}>
          {index > 0 && (
            <button
              type="button"
              className="prts-additional-card__remove"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove qualification ${index + 1}`}
            >
              <i className="pi pi-times" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface EducationAdditionalSectionProps {
  items: AdditionalQualificationState[];
  mainQualificationId: string;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, patch: AdditionalPatch) => void;
  additionalErrors?: Record<number, Record<string, string>>;
  onClearAdditionalError?: (id: number, field: string) => void;
}

export default function EducationAdditionalSection({
  items,
  mainQualificationId,
  onAdd,
  onRemove,
  onUpdate,
  additionalErrors = {},
  onClearAdditionalError,
}: EducationAdditionalSectionProps) {
  const [qualificationOptions, setQualificationOptions] = useState<
    PharmacyDropdownOption[]
  >([]);

  useEffect(() => {
    fetchQualifications()
      .then((data: any) => {
        const list: any[] = Array.isArray(data) ? data : [];
        setQualificationOptions(
          list.map((q) => ({ label: q.qualificationName, value: q.uuid })),
        );
      })
      .catch(() => {});
  }, []);

  return (
    <PrtsRegistrationAccordionSection
      title="Additional Qualification (if any)"
      headerExtra={
        <button
          type="button"
          className="prts-btn prts-btn--outline prts-btn--add "
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
        >
          <span>+</span>
          <span>Add</span>
        </button>
      }
    >
      <div className="prts-additional-list">
        {items.map((item, index) => {
          const otherSelectedIds = items
            .filter((i) => i.id !== item.id && i.qualificationId)
            .map((i) => i.qualificationId as string);
          const excludeIds = mainQualificationId
            ? [mainQualificationId, ...otherSelectedIds]
            : otherSelectedIds;
          return (
          <AdditionalQualificationCard
            key={item.id}
            item={item}
            index={index}
            qualificationOptions={qualificationOptions}
            excludeIds={excludeIds}
            onRemove={onRemove}
            onUpdate={onUpdate}
            externalErrors={additionalErrors[item.id]}
            onClearExternalError={(field) => onClearAdditionalError?.(item.id, field)}
          />
          );
        })}
      </div>
    </PrtsRegistrationAccordionSection>
  );
}
