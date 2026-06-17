"use client";

import { Calendar } from "primereact/calendar";
import { PersonalState } from "../registrationState";
import PrtsRegistrationAccordionSection from "./PrtsRegistrationAccordionSection";
import {
  BLOOD_GROUP_OPTIONS,
  CATEGORY_OPTIONS,
  GENDER_OPTIONS,
  NATIONALITY_OPTIONS,
  RELIGION_OPTIONS,
} from "../constants";
import PharmacyDropdown from "../../components/PharmacyDropdown";

const maxDob = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d;
})();

function parseDob(val: Date | string | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function formatDob(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface PersonalDetailsMainSectionProps {
  form: PersonalState;
  errors: Record<string, string>;
  onUpdate: (key: keyof PersonalState, value: string) => void;
}

export default function PersonalDetailsMainSection({
  form,
  errors,
  onUpdate,
}: PersonalDetailsMainSectionProps) {
  return (
    <PrtsRegistrationAccordionSection title="Personal Details">
      <div className="prts-form-grid prts-form-grid--3a">
        <div className={`prts-field prts-field--full ${errors.fullName ? "prts-field--error" : ""}`}>
          <label className="prts-field__label">Full Name<span className="prts-field__required">*</span></label>
          <div className="prts-field__wrapper">
            <input
              className="prts-field__input"
              value={form.fullName}
              onChange={(e) => onUpdate("fullName", e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          {errors.fullName && <span className="prts-field__error-message">{errors.fullName}</span>}
        </div>

        <PharmacyDropdown
          label="Gender"
          value={form.gender || null}
          onChange={(value) => onUpdate("gender", value ?? "")}
          options={GENDER_OPTIONS}
          required
          errorMessage={errors.gender}
        />

        <div className={`prts-field prts-field--date ${errors.dob ? "prts-field--error" : ""}`}>
          <label className="prts-field__label">
            Date of Birth<span className="prts-field__required">*</span>
          </label>
          <div className="prts-field__wrapper prts-calendar-wrapper">
            <Calendar
              value={parseDob(form.dob)}
              onChange={(e) => onUpdate("dob", e.value ? formatDob(e.value as Date) : "")}
              dateFormat="dd/mm/yy"
              placeholder="DD/MM/YYYY"
              maxDate={maxDob}
              showIcon={false}
              className="prts-field__calendar"
              inputClassName="prts-field__input prts-calendar-input"
              panelClassName="prts-pharmacy-datepicker-panel"
            />
          </div>
          {errors.dob && <span className="prts-field__error-message">{errors.dob}</span>}
        </div>

        <div className={`prts-field ${errors.birthPlace ? "prts-field--error" : ""}`}>
          <label className="prts-field__label">
            Birth Place<span className="prts-field__required">*</span>
          </label>
          <div className="prts-field__wrapper">
            <input
              className="prts-field__input"
              value={form.birthPlace}
              onChange={(e) => onUpdate("birthPlace", e.target.value)}
            />
          </div>
          {errors.birthPlace && <span className="prts-field__error-message">{errors.birthPlace}</span>}
        </div>

        <PharmacyDropdown
          label="Blood Group"
          value={form.bloodGroup || null}
          onChange={(value) => onUpdate("bloodGroup", value ?? "")}
          options={BLOOD_GROUP_OPTIONS}
          required
          errorMessage={errors.bloodGroup}
        />

        <PharmacyDropdown
          label="Nationality"
          value={form.nationality || null}
          onChange={(value) => onUpdate("nationality", value ?? "")}
          options={NATIONALITY_OPTIONS}
          required
          disabled
          errorMessage={errors.nationality}
        />

        <PharmacyDropdown
          label="Religion"
          value={form.religion || null}
          onChange={(value) => onUpdate("religion", value ?? "")}
          options={RELIGION_OPTIONS}
          required
          errorMessage={errors.religion}
        />

        <PharmacyDropdown
          label="Category"
          value={form.category || null}
          onChange={(value) => onUpdate("category", value ?? "")}
          options={CATEGORY_OPTIONS}
          required
          errorMessage={errors.category}
        />
      </div>
    </PrtsRegistrationAccordionSection>
  );
}
