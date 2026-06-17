"use client";

import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetCommunicationSection,
  selectCommunication,
  updateCommunicationAddress,
  setCommunicationAgreed,
} from "@/store/slices";
import CommunicationPermanentAddress from "../forms/CommunicationPermanentAddress";
import CommunicationCorrespondenceAddress from "../forms/CommunicationCorrespondenceAddress";
import CommunicationProfessionalAddress from "../forms/CommunicationProfessionalAddress";
import CommunicationDetailsFooter from "../forms/CommunicationDetailsFooter";
import { saveCommunicationDetails } from "@/services/communicationService";
import { loadUser } from "@/lib/auth/storage";
import {
  validateCommunication,
  extractAddressErrors,
  type ValidationError,
} from "../validators";

interface CommunicationDetailsStepProps {
  onBack: () => void;
  onContinue: () => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

export default function CommunicationDetailsStep({ onBack, onContinue, validationTrigger, onScrollToTop }: CommunicationDetailsStepProps) {
  const dispatch = useAppDispatch();
  const communication = useAppSelector(selectCommunication);
  const { permanent, correspondence, professional, agreedToTerms } = communication;

  const toast = useRef<Toast>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationError>({});

  useEffect(() => {
    if (!validationTrigger) return;
    const errors = validateCommunication(communication);
    setFieldErrors(errors);
    onScrollToTop?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationTrigger]);

  const clearAddressErrors = (prefix: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      ["Address", "PinCode", "State", "District", "City"].forEach((f) => delete next[`${prefix}${f}`]);
      return next;
    });
  };

  const copyPermanentToCorrespondence = () => {
    dispatch(
      updateCommunicationAddress({
        key: "correspondence",
        patch: { ...permanent },
      }),
    );
    clearAddressErrors("correspondence");
  };

  const handleContinue = async () => {
    const errors = validateCommunication(communication);
    const { agreedToTerms: _agreed, ...addressErrors } = errors;
    if (Object.keys(addressErrors).length > 0) {
      setFieldErrors(addressErrors);
      onScrollToTop?.();
      return;
    }
    setFieldErrors({});

    const user = loadUser();
    const userUuid = user?.id ?? "";

    setIsSaving(true);
    try {
      await saveCommunicationDetails(userUuid, communication);
      onContinue();
    } catch {
      onScrollToTop?.();
      toast.current?.show({
        severity: "error",
        summary: "Save Failed",
        detail: "Could not save communication details. Please try again.",
        life: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const permanentErrors = extractAddressErrors(fieldErrors, "permanent");
  const correspondenceErrors = extractAddressErrors(fieldErrors, "correspondence");
  const professionalErrors = extractAddressErrors(fieldErrors, "professional");

  return (
    <div className="prts-communication-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-communication-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title">Communication Details</h1>
            <p className="prts-step-content__desc">
              Please provide your permanent, correspondence, and professional address details for official communication and registration purposes.
              <br /><br />
              Ensure the information entered is accurate and up to date for receiving important notifications and documents.
            </p>
          </div>

          <div className="prts-personal-accordion-group">
            <CommunicationPermanentAddress
              data={permanent}
              errors={permanentErrors}
              onChange={(next) => {
                clearAddressErrors("permanent");
                dispatch(updateCommunicationAddress({ key: "permanent", patch: next }));
              }}
            />

            <CommunicationCorrespondenceAddress
              data={correspondence}
              errors={correspondenceErrors}
              onCopyFromPermanent={copyPermanentToCorrespondence}
              onChange={(next) => {
                clearAddressErrors("correspondence");
                dispatch(updateCommunicationAddress({ key: "correspondence", patch: next }));
              }}
            />

            <CommunicationProfessionalAddress
              data={professional}
              errors={professionalErrors}
              onChange={(next) => {
                clearAddressErrors("professional");
                dispatch(updateCommunicationAddress({ key: "professional", patch: next }));
              }}
            />
          </div>

          <div className="prts-terms">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => dispatch(setCommunicationAgreed(e.target.checked))}
            />
            <label htmlFor="terms" className="prts-terms__label">
              I agree to the <a href="#" className="prts-terms__link">Terms and Conditions</a>
            </label>
          </div>

          <div className="prts-alert prts-alert--warning">
            <img
              src="/assets/fresh-registration/Info.svg"
              alt="Info"
              className="prts-alert__icon"
            />
            <span>After Submission of this form you need to upload document.</span>
          </div>
        </div>
      </div>

      <div className="prts-communication-footer">
        <CommunicationDetailsFooter
          onReset={() => dispatch(resetCommunicationSection())}
          onBack={onBack}
          onContinue={handleContinue}
          continueDisabled={!agreedToTerms || isSaving}
        />
      </div>
    </div>
  );
}
