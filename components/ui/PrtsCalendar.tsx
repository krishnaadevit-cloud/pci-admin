"use client";

import { Calendar } from "primereact/calendar";
import { Nullable } from "primereact/ts-helpers";

interface PrtsCalendarProps {
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

export default function PrtsCalendar({
  label,
  value,
  onChange,
  required = false,
  view = "date",
  dateFormat = "dd-mm-yy",
  placeholder = "",
  className = "",
  width = "300px",
}: PrtsCalendarProps) {
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

      <Calendar
        value={value}
        onChange={(e) => onChange((e.value as Nullable<Date>) ?? null)}
        view={view}
        dateFormat={dateFormat}
        placeholder={placeholder}
        showIcon
        className="prts-field__calendar"
      />
    </div>
  );
}
