"use client";

import { useState } from "react";
import PrtsRegistrationAccordionSection from "@/app/(full-page)/pharmacy/fresh-registration/forms/PrtsRegistrationAccordionSection";
import type { PharmacistReference } from "../constants";

interface PharmacistReferences {
  pharmacist1: PharmacistReference;
  pharmacist2: PharmacistReference;
}

interface PharmacistReferencesStepProps {
  onBack: () => void;
  onContinue: (refs: PharmacistReferences) => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

const blankRef: PharmacistReference = {
  registrationNo: "",
  fullName: "",
  address: "",
};

function ReferenceForm({
  label,
  value,
  errors,
  onChange,
}: {
  label: string;
  value: PharmacistReference;
  errors: Partial<Record<keyof PharmacistReference, string>>;
  onChange: (field: keyof PharmacistReference, val: string) => void;
}) {
  return (
    <PrtsRegistrationAccordionSection title={label}>
      <div className="prts-application-preview prts-application-preview--inline">
        <div className="prts-form-grid prts-form-grid--2">
          <div className={`prts-field ${errors.registrationNo ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              Registration No.<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <input
                className="prts-field__input"
                value={value.registrationNo}
                onChange={(e) => onChange("registrationNo", e.target.value)}
                placeholder="Enter registration number"
              />
            </div>
            {errors.registrationNo && (
              <span className="prts-field__error-message">{errors.registrationNo}</span>
            )}
          </div>

          <div className={`prts-field ${errors.fullName ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              Full Name<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <input
                className="prts-field__input"
                value={value.fullName}
                onChange={(e) => onChange("fullName", e.target.value)}
                placeholder="Enter full name"
              />
            </div>
            {errors.fullName && (
              <span className="prts-field__error-message">{errors.fullName}</span>
            )}
          </div>
        </div>

        <div className="prts-form-grid prts-form-grid--1 mt-4">
          <div className={`prts-field ${errors.address ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              Address<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <textarea
                className="prts-field__input prts-field__textarea"
                rows={3}
                value={value.address}
                onChange={(e) => onChange("address", e.target.value)}
                placeholder="Enter address"
              />
            </div>
            {errors.address && (
              <span className="prts-field__error-message">{errors.address}</span>
            )}
          </div>
        </div>
      </div>
    </PrtsRegistrationAccordionSection>
  );
}

export default function PharmacistReferencesStep({
  onBack,
  onContinue,
  onScrollToTop,
}: PharmacistReferencesStepProps) {
  const [pharmacist1, setPharmacist1] = useState<PharmacistReference>({ ...blankRef });
  const [pharmacist2, setPharmacist2] = useState<PharmacistReference>({ ...blankRef });
  const [errors1, setErrors1] = useState<Partial<Record<keyof PharmacistReference, string>>>({});
  const [errors2, setErrors2] = useState<Partial<Record<keyof PharmacistReference, string>>>({});

  const validate = (
    ref: PharmacistReference,
  ): Partial<Record<keyof PharmacistReference, string>> => {
    const errs: Partial<Record<keyof PharmacistReference, string>> = {};
    if (!ref.registrationNo.trim()) errs.registrationNo = "Registration No. is required.";
    if (!ref.fullName.trim()) errs.fullName = "Full Name is required.";
    if (!ref.address.trim()) errs.address = "Address is required.";
    return errs;
  };

  const handleContinue = () => {
    const e1 = validate(pharmacist1);
    const e2 = validate(pharmacist2);
    setErrors1(e1);
    setErrors2(e2);

    if (Object.keys(e1).length > 0 || Object.keys(e2).length > 0) {
      onScrollToTop?.();
      return;
    }

    onContinue({ pharmacist1, pharmacist2 });
  };

  const updatePharmacist1 = (field: keyof PharmacistReference, val: string) => {
    setPharmacist1((prev) => ({ ...prev, [field]: val }));
    if (errors1[field]) setErrors1((prev) => ({ ...prev, [field]: undefined }));
  };

  const updatePharmacist2 = (field: keyof PharmacistReference, val: string) => {
    setPharmacist2((prev) => ({ ...prev, [field]: val }));
    if (errors2[field]) setErrors2((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="prts-personal-wrapper">
      <div className="prts-personal-form-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title m-0">Pharmacist References</h1>
          </div>
        </div>

        <div className="prts-personal-accordion-group m-0 mt-4">
          <ReferenceForm
            label="1st Pharmacist"
            value={pharmacist1}
            errors={errors1}
            onChange={updatePharmacist1}
          />
          <ReferenceForm
            label="2nd Pharmacist"
            value={pharmacist2}
            errors={errors2}
            onChange={updatePharmacist2}
          />
        </div>

        <div className="prts-form-footer__actions mt-3">
          <button
            type="button"
            className="prts-btn prts-btn--outline"
            onClick={onBack}
          >
            Back
          </button>
          <button
            type="button"
            className="prts-btn prts-btn--primary"
            onClick={handleContinue}
          >
            Continue to Document
          </button>
        </div>
      </div>
    </div>
  );
}
