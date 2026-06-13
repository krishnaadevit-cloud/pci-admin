"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

interface PrtsFloatingFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "tel" | "password" | "number" | "date";
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  suffix?: React.ReactNode;
  error?: string;
  disablePaste?: boolean;
}

export default function PrtsFloatingField({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder = " ",
  autoComplete,
  suffix,
  error,
  disablePaste = false,
}: PrtsFloatingFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`prts-float-field ${suffix ? "prts-float-field--date" : ""
        } prts-float-field--active${error ? " prts-float-field--error" : ""}`}
    >

      <div className="prts-float-field__control">

        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={disablePaste ? (e) => e.preventDefault() : undefined}
        />
        {suffix}

      </div>

      <label htmlFor={id}>
        {label}
        {required && <span className="prts-float-field__req">*</span>}

      </label>
      {error && <p className="prts-float-field__error">{error}</p>}

    </div>
  );
}

interface PrtsFloatingSelectProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: { label: string; value: string }[];
  required?: boolean;
  disabled?: boolean;
  className?: string;
  width?: string;
  showClearButton?: boolean;
  error?: string;
}

export function PrtsFloatingSelect({
  label,
  value,
  onChange,
  options,
  required,
  disabled = false,
  className = "",
  width = "100%",
  showClearButton = false,
  error,
}: PrtsFloatingSelectProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [panelWidth, setPanelWidth] = useState<string | undefined>();

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const syncWidth = () => {
      setPanelWidth(`${el.getBoundingClientRect().width}px`);
    };

    syncWidth();
    const observer = new ResizeObserver(syncWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [width]);

  const fieldClass = [
    "prts-float-field",
    "prts-float-field--select",
    "prts-float-field--active",
    error ? "prts-float-field--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClass} style={{ width }}>

      <div
        ref={wrapperRef}
        className="prts-float-field__control prts-dropdown-wrapper"
      >

        <Dropdown
          inputId={id}
          value={value}
          onChange={(e: DropdownChangeEvent) => onChange(e.value ?? null)}
          options={options}
          optionLabel="label"
          optionValue="value"
          placeholder=" "
          disabled={disabled}
          showClear={showClearButton}
          className="prts-field__dropdown prts-custom-dropdown"
          panelStyle={
            panelWidth
              ? {
                width: panelWidth,
                minWidth: panelWidth,
                maxWidth: panelWidth,
              }
              : undefined
          }
          dropdownIcon={() => <></>} // Hide default chevron
          pt={{}}
        />

        <Image
          src="/assets/header/dropdownarrow.svg"
          alt="dropdown arrow"
          width={10}
          height={5}
          aria-hidden
          className="prts-float-field__chevron"
        />

      </div>

      <label htmlFor={id}>
        {label}
        {required && <span className="prts-float-field__req">*</span>}

      </label>
      {error && <p className="prts-float-field__error">{error}</p>}

    </div>
  );
}

interface PrtsFloatingPhoneProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  disablePaste?: boolean;
}

export function PrtsFloatingPhone({
  label,
  value,
  onChange,
  required,
  error,
  disablePaste = false,
}: PrtsFloatingPhoneProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`prts-float-field prts-float-field--active${error ? " prts-float-field--error" : ""
        }`}
    >

      <label htmlFor={id}>
        {label}
        {required && <span className="prts-float-field__req">*</span>}

      </label>

      <div className="prts-float-field__phone-row">
        <span className="prts-float-field__prefix">+91</span>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          value={value}
          placeholder="12345 67890"
          required={required}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={disablePaste ? (e) => e.preventDefault() : undefined}
        />

      </div>
      {error && <p className="prts-float-field__error">{error}</p>}

    </div>
  );
}
