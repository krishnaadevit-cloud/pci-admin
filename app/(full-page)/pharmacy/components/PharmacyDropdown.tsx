"use client";

import { useEffect, useRef, useState } from "react";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";

export interface PharmacyDropdownOption {
  label: string;
  value: string;
}

export interface PharmacyDropdownProps {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: PharmacyDropdownOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  width?: string;
  showClearButton?: boolean;
  filter?: boolean;
  errorMessage?: string;
}

export default function PharmacyDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = "-- Select --",
  required = true,
  disabled = false,
  className = "",
  width = "100%",
  showClearButton = true,
  filter = true,
  errorMessage,
}: PharmacyDropdownProps) {
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
    "prts-field",
    "prts-field--dropdown",
    value ? "prts-field--filled" : "",
    errorMessage ? "prts-field--error" : "",
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

      <div ref={wrapperRef} className="prts-field__wrapper prts-dropdown-wrapper">
        <Dropdown
          value={value}
          onChange={(e: DropdownChangeEvent) => onChange(e.value ?? null)}
          options={options}
          optionLabel="label"
          optionValue="value"
          placeholder={placeholder}
          disabled={disabled}
          showClear={showClearButton}
          filter={filter}
          filterPlaceholder="Search..."
          aria-invalid={errorMessage ? true : undefined}
          className="prts-field__dropdown prts-custom-dropdown"
          panelClassName="prts-pharmacy-dropdown-panel"
          panelStyle={
            panelWidth
              ? { width: panelWidth, minWidth: panelWidth, maxWidth: panelWidth }
              : undefined
          }
          pt={{
            panel: {
              className: "prts-pharmacy-dropdown-panel",
            },
          }}
        />
        <img
          src="/assets/fresh-registration/down-arrow.svg"
          alt=""
          aria-hidden
          className="prts-dropdown-icon"
        />
      </div>
      {errorMessage && (
        <span className="prts-field__error-message">{errorMessage}</span>
      )}
    </div>
  );
}
