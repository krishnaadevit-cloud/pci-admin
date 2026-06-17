"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetPersonalForm, selectPersonal, updatePersonal, setApplicationId } from "@/store/slices";
import { validatePersonal } from "@/app/(full-page)/pharmacy/fresh-registration/validators";
import { saveFreshApplication } from "@/services/authService";
import { loadUser } from "@/lib/auth/cookieStorage";
import PersonalDetailsMainSection from "@/app/(full-page)/pharmacy/fresh-registration/forms/PersonalDetailsMainSection";
import PersonalContactSection from "@/app/(full-page)/pharmacy/fresh-registration/forms/PersonalContactSection";
import PersonalDetailsFooter from "@/app/(full-page)/pharmacy/fresh-registration/forms/PersonalDetailsFooter";

interface PersonalDetailsStepProps {
  onBack: () => void;
  onContinue: () => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

/** Maps Redux PersonalState → API request body.
 *  Only personal_details is sent at this step.
 *  educational_details, communication_details, etc. are added in their own steps. */
function buildPersonalPayload(personal: ReturnType<typeof selectPersonal>) {
  const authUser = loadUser();
  return {
    user_uuid: authUser?.id ?? "",
    personal_details: {
      full_name: personal.fullName,
      email: personal.email,
      mobile_no: personal.mobile,
      alternate_mobile_no: personal.altMobile,
      gender: personal.gender.toUpperCase(),
      birth_date: personal.dob,
      birth_place: personal.birthPlace,
      nationality: "Indian",
      blood_group: personal.bloodGroup,
      religion: personal.religion,
      category: personal.category,
      aadhaar_verified: personal.aadhaarVerified,
    },
  };
}

export default function PersonalDetailsStep({ onBack, onContinue, validationTrigger, onScrollToTop }: PersonalDetailsStepProps) {
  const dispatch = useAppDispatch();
  const form = useAppSelector(selectPersonal);
  const toast = useRef<Toast>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const authUser = loadUser();
    const patch: Partial<typeof form> = {};
    if (authUser?.mobile && !form.mobile) patch.mobile = authUser.mobile;
    if (authUser?.email && !form.email) patch.email = authUser.email;
    if (!form.nationality) patch.nationality = "Indian";
    if (!form.fullName && (form.surname || form.firstName)) {
      patch.fullName = [form.surname, form.firstName, form.middleName].filter(Boolean).join(" ");
    }
    if (Object.keys(patch).length > 0) dispatch(updatePersonal(patch));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!validationTrigger) return;
    setErrors(validatePersonal(form));
    onScrollToTop?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationTrigger]);

  const update = (key: keyof typeof form, value: string) => {
    dispatch(updatePersonal({ [key]: value } as Partial<typeof form>));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const blurField = (key: keyof typeof form) => {
    const allErrors = validatePersonal({ ...form });
    if (allErrors[key]) {
      setErrors((prev) => ({ ...prev, [key]: allErrors[key] }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleContinue = useCallback(async () => {
    // 1. Client-side validation
    const validationErrors = validatePersonal(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      onScrollToTop?.();
      return;
    }
    setErrors({});

    // 2. Call API
    setIsLoading(true);
    try {
      const payload = buildPersonalPayload(form);
      const response = await saveFreshApplication(payload);

      // 3. Persist applicationId returned by the API
      const applicationId: string | undefined =
        response?.data?.fresh_application_uuid ??
        response?.data?.personalDetails?.uuid ??
        response?.personalDetails?.uuid ??
        response?.applicationId ??
        response?.data?.applicationId ??
        response?.id;
      if (applicationId) {
        dispatch(setApplicationId(applicationId));
      }

      // 4. Advance to Education step
      onContinue();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to save personal details. Please try again.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, form, onContinue]);

  return (
    <div className="prts-personal-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-personal-form-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title">Personal Details</h1>
            <p className="prts-step-content__desc">
              Please provide your personal and identification details exactly as per your official
              documents. This information will be used for verification, registration records, and
              future communication.
            </p>
          </div>

          <div className="prts-personal-accordion-group">
            <PersonalDetailsMainSection form={form} errors={errors} onUpdate={update} />
            <PersonalContactSection form={form} errors={errors} onUpdate={update} onBlur={blurField} />
          </div>
        </div>
      </div>

      <div className="prts-personal-footer">
        <PersonalDetailsFooter
          onReset={() => dispatch(resetPersonalForm())}
          onBack={onBack}
          onContinue={handleContinue}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
