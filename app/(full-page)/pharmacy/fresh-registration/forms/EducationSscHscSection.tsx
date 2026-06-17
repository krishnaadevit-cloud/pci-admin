"use client";

import { Calendar } from "primereact/calendar";
import { EducationState } from "../registrationState";
import PrtsRegistrationAccordionSection from "./PrtsRegistrationAccordionSection";
import PharmacyDropdown, { PharmacyDropdownOption } from "../../components/PharmacyDropdown";

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

interface EducationSscHscSectionProps {
  form: EducationState;
  errors: Record<string, string>;
  onUpdate: (key: keyof EducationState, value: string) => void;
  boardOptions: PharmacyDropdownOption[];
  loadingBoards?: boolean;
}

export default function EducationSscHscSection({ form, errors, onUpdate, boardOptions, loadingBoards }: EducationSscHscSectionProps) {
  const sscParsed = parseYearMonth(form.sscYear);
  const minHscDate = sscParsed ? new Date(sscParsed.getFullYear(), sscParsed.getMonth() + 1, 1) : undefined;

  return (
    <PrtsRegistrationAccordionSection title="Education Details (SSC & HSC)">
      <div className="prts-subsection">
        <h4 className="prts-subsection__title">SSC</h4>
        <div className="prts-form-grid prts-form-grid--3a-school">
          <div className={`prts-field ${errors.sscSchool ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              School Name<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <input
                className="prts-field__input"
                value={form.sscSchool}
                onChange={(e) => onUpdate("sscSchool", e.target.value)}
              />
            </div>
            {errors.sscSchool && <span className="prts-field__error-message">{errors.sscSchool}</span>}
          </div>
          <PharmacyDropdown
            label="Board"
            value={form.sscBoard || null}
            onChange={(value) => onUpdate("sscBoard", value ?? "")}
            options={boardOptions}
            required
            disabled={loadingBoards}
            placeholder={loadingBoards ? "Loading boards..." : "-- Select --"}
            errorMessage={errors.sscBoard}
          />
          <div className={`prts-field prts-field--date ${errors.sscYear ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              Passed Year<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper prts-calendar-wrapper">
              <Calendar
                value={parseYearMonth(form.sscYear)}
                onChange={(e) => onUpdate("sscYear", e.value ? formatYearMonth(e.value as Date) : "")}
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
            {errors.sscYear && <span className="prts-field__error-message">{errors.sscYear}</span>}
          </div>
        </div>
      </div>
      <div className="prts-subsection">
        <h4 className="prts-subsection__title">HSC</h4>
        <div className="prts-form-grid prts-form-grid--3-school">
          <div className={`prts-field ${errors.hscSchool ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              School Name<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <input
                className="prts-field__input"
                value={form.hscSchool}
                onChange={(e) => onUpdate("hscSchool", e.target.value)}
              />
            </div>
            {errors.hscSchool && <span className="prts-field__error-message">{errors.hscSchool}</span>}
          </div>
          <PharmacyDropdown
            label="Board"
            value={form.hscBoard || null}
            onChange={(value) => onUpdate("hscBoard", value ?? "")}
            options={boardOptions}
            required
            disabled={loadingBoards}
            placeholder={loadingBoards ? "Loading boards..." : "-- Select --"}
            errorMessage={errors.hscBoard}
          />
          <div className={`prts-field prts-field--date ${errors.hscYear ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              Passed Year<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper prts-calendar-wrapper">
              <Calendar
                value={parseYearMonth(form.hscYear)}
                onChange={(e) => onUpdate("hscYear", e.value ? formatYearMonth(e.value as Date) : "")}
                view="month"
                dateFormat="MM yy"
                placeholder="Month YYYY"
                minDate={minHscDate}
                maxDate={new Date()}
                showIcon={false}
                className="prts-field__calendar"
                inputClassName="prts-field__input prts-calendar-input"
                panelClassName="prts-pharmacy-datepicker-panel"
              />
            </div>
            {errors.hscYear && <span className="prts-field__error-message">{errors.hscYear}</span>}
          </div>
        </div>
      </div>
    </PrtsRegistrationAccordionSection>
  );
}
