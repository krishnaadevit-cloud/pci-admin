"use client";

import { PersonalState } from "../registrationState";
import PrtsRegistrationAccordionSection from "./PrtsRegistrationAccordionSection";

interface PersonalContactSectionProps {
  form: PersonalState;
  errors: Record<string, string>;
  onUpdate: (key: keyof PersonalState, value: string | Date | null) => void;
  onBlur?: (key: keyof PersonalState) => void;
}

export default function PersonalContactSection({
  form,
  errors,
  onUpdate,
  onBlur,
}: PersonalContactSectionProps) {
  return (
    <PrtsRegistrationAccordionSection title="Contact Details">
      <div className="prts-form-grid prts-form-grid--3">
        <div className={`prts-field prts-field--verified ${errors.mobile ? "prts-field--error" : ""}`}>
          <label className="prts-field__label">
            Mobile No.<span className="prts-field__required">*</span>
          </label>
          <div className="prts-field__wrapper">
            <span className="prts-field__prefix" style={{ lineHeight: "14px" }}>+91</span>
            <input
              className="prts-field__input"
              type="tel"
              value={form.mobile}
              placeholder="10-digit number"
              maxLength={10}
              disabled
              readOnly
            />
            <span className="prts-field__verified-icon" aria-hidden>✓</span>
          </div>
          {errors.mobile && <span className="prts-field__error-message">{errors.mobile}</span>}
        </div>

        <div className={`prts-field ${errors.altMobile ? "prts-field--error" : ""}`}>
          <label className="prts-field__label">
            Alternate Mobile
          </label>
          <div className="prts-field__wrapper">
            <span className="prts-field__prefix" style={{ lineHeight: "14px" }}>+91</span>
            <input
              className="prts-field__input"
              type="tel"
              value={form.altMobile}
              placeholder="10-digit number"
              maxLength={10}
              onChange={(e) => onUpdate("altMobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              onBlur={() => onBlur?.("altMobile")}
            />
          </div>
          {errors.altMobile && <span className="prts-field__error-message">{errors.altMobile}</span>}
        </div>

        <div className={`prts-field prts-field--verified ${errors.email ? "prts-field--error" : ""}`}>
          <label className="prts-field__label">
            Email Address<span className="prts-field__required">*</span>
          </label>
          <div className="prts-field__wrapper">
            <input
              className="prts-field__input"
              type="email"
              value={form.email}
              placeholder="email@example.com"
              disabled
              readOnly
            />
            <span className="prts-field__verified-icon" aria-hidden>✓</span>
          </div>
          {errors.email && <span className="prts-field__error-message">{errors.email}</span>}
        </div>
      </div>
    </PrtsRegistrationAccordionSection>
  );
}
