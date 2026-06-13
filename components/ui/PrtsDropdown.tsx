"use client";

import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface PrtsDropdownProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  width?: string;
}

export default function PrtsDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = "-- Select --",
  required = false,
  disabled = false,
  className = "",
  width = "300px",
}: PrtsDropdownProps) {
  const fieldClass = [
    "prts-field",
    "prts-field--dropdown",
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

      <Dropdown
        value={value}
        onChange={(e: DropdownChangeEvent) => onChange(e.value ?? null)}
        options={options}
        optionLabel="label"
        optionValue="value"
        placeholder={placeholder}
        disabled={disabled}
        className="prts-field__dropdown"
      />
    </div>
  );
}
