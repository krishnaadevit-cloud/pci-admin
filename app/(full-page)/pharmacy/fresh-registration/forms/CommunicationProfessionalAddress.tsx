"use client";

import { useRef, useState } from "react";
import { AddressState } from "../registrationState";
import PrtsRegistrationAccordionSection from "./PrtsRegistrationAccordionSection";
import type { AddressFieldErrors } from "../validators";
import { getAllDetails } from "@/service/MDM_Service";
import { MDM_PINCODE } from "@/config/ApiConstant";

interface CommunicationProfessionalAddressProps {
  data: AddressState;
  errors?: AddressFieldErrors;
  onChange: (data: AddressState) => void;
}

export default function CommunicationProfessionalAddress({
  data,
  errors,
  onChange,
}: CommunicationProfessionalAddressProps) {
  const dataRef = useRef(data);
  dataRef.current = data;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [loadingPincode, setLoadingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const update = (key: keyof AddressState, value: string) => {
    onChange({ ...dataRef.current, [key]: value });
  };

  const handlePincodeChange = (raw: string) => {
    const value = raw.replace(/\D/g, "").slice(0, 6);
    onChange({ ...dataRef.current, pinCode: value, state: "", district: "", city: "" });

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length === 0) { setPincodeError(""); return; }
    if (value[0] === "0") { setPincodeError("Pincode cannot start with 0"); return; }
    setPincodeError("");
    if (value.length !== 6) return;

    debounceRef.current = setTimeout(async () => {
      setLoadingPincode(true);
      try {
        const response = await getAllDetails(`${MDM_PINCODE}/${value}`);
        const record = Array.isArray(response?.PostOffice) ? response?.PostOffice[0] : response;
        const state = record?.State ?? "";
        const district = record?.District;
        const city = record?.Division ;
        if (!state && !district) {
          setPincodeError("Invalid pincode. No records found.");
        } else {
          setPincodeError("");
          onChange({ ...dataRef.current, pinCode: value, state, district, city });
        }
      } catch {
        setPincodeError("Failed to fetch pincode details. Please try again.");
      } finally {
        setLoadingPincode(false);
      }
    }, 500);
  };

  return (
    <PrtsRegistrationAccordionSection title="Professional Address">
      <div className="prts-address-fields">
        <div className="prts-address-fields__full">
          <div className={`prts-field ${errors?.address ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              Address<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <textarea
                className="prts-field__input prts-field__textarea"
                rows={3}
                placeholder="Flat/House No., Building Name, Street/Road, Area/Locality, Landmark (if any)"
                value={data.address}
                onChange={(e) => update("address", e.target.value)}
              />
            </div>
            {errors?.address && <span className="prts-field__error-message">{errors.address}</span>}
          </div>
        </div>
        <div className="prts-form-grid prts-form-grid--5">
          <div className={`prts-field ${pincodeError || errors?.pinCode ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              Pin Code<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <input
                className="prts-field__input"
                value={data.pinCode}
                maxLength={6}
                onChange={(e) => handlePincodeChange(e.target.value)}
              />
            </div>
            {(pincodeError || errors?.pinCode) && (
              <span className="prts-field__error-message">{pincodeError || errors?.pinCode}</span>
            )}
          </div>
          <div className={`prts-field ${errors?.state ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              State<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <input
                className="prts-field__input"
                value={loadingPincode ? "Loading..." : data.state}
                readOnly
                disabled
              />
            </div>
            {errors?.state && <span className="prts-field__error-message">{errors.state}</span>}
          </div>
          <div className={`prts-field ${errors?.district ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              District<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <input
                className="prts-field__input"
                value={loadingPincode ? "Loading..." : data.district}
                readOnly
                disabled
              />
            </div>
            {errors?.district && <span className="prts-field__error-message">{errors.district}</span>}
          </div>
          <div className={`prts-field ${errors?.city ? "prts-field--error" : ""}`}>
            <label className="prts-field__label">
              City<span className="prts-field__required">*</span>
            </label>
            <div className="prts-field__wrapper">
              <input
                className="prts-field__input"
                value={loadingPincode ? "Loading..." : data.city}
                readOnly
                disabled
              />
            </div>
            {errors?.city && <span className="prts-field__error-message">{errors.city}</span>}
          </div>
        </div>
      </div>
    </PrtsRegistrationAccordionSection>
  );
}
