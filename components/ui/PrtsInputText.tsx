"use client";

import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { ChangeEvent, CSSProperties, ReactNode } from "react";

interface PrtsInputTextProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  prefix?: ReactNode;
  verified?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  className?: string;
error?:boolean;
  // NEW PROP
  width?: string;
  errorMessage?: string;
}

export default function PrtsInputText({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  prefix,
  verified = false,
  disabled = false,
  multiline = false,
  className = "",
  width = "300px", // DEFAULT WIDTH
}: PrtsInputTextProps) {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onChange(e.target.value);
  };

  const fieldClass = [
    "prts-field",
    value ? "prts-field--filled" : "",
    verified ? "prts-field--verified" : "",
    disabled ? "prts-field--disabled" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const fieldStyle: CSSProperties = {
    width,
  };

  return (
    <div className={fieldClass} style={fieldStyle}>
      <label className="prts-field__label">
        {label}
        {required && <span className="prts-field__required">*</span>}
      </label>

      <div className="prts-field__wrapper">
        {prefix && <span className="prts-field__prefix">{prefix}</span>}

        {multiline ? (
          <InputTextarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className="prts-field__input prts-field__textarea"
            rows={3}
          />
        ) : (
          <InputText
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            className="prts-field__input"
          />
        )}

        {verified && (
          <span className="prts-field__verified-icon">
            <i className="pi pi-check" />
          </span>
        )}
      </div>
    </div>
  );
}
