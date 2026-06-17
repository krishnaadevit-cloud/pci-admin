"use client";

import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";

export interface PharmacyCalendarProps {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  required?: boolean;
  view?: "date" | "month" | "year";
  dateFormat?: string;
  placeholder?: string;
  className?: string;
  width?: string;
}

/**
 * Pharmacy-scoped PrimeReact calendar with custom icon (SCSS in pharmacy overrides).
 */
export default function PharmacyCalendar({
  label,
  value,
  onChange,
  required = false,
  view = "date",
  dateFormat = "dd-mm-yy",
  placeholder = "",
  className = "",
  width = "300px",
}: PharmacyCalendarProps) {
  const fieldClass = [
    "prts-field",
    "prts-field--calendar",
    value ? "prts-field--filled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClass} style={{ width }}>
      <label className="prts-field__label">
        {label}
        {required && <span className="prts-field__required">*</span>}
      </label>

      <div className="prts-field__wrapper prts-calendar-wrapper">
        <Calendar
          value={value}
          onChange={(e) => onChange((e.value as Nullable<Date>) ?? null)}
          view={view}
          dateFormat={dateFormat}
          placeholder={placeholder}
          showIcon={false}
          className="prts-field__calendar"
          inputClassName="prts-calendar-input"
        />
      </div>
    </div>
  );
}
