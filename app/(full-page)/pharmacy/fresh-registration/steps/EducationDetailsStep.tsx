"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  resetEducationSection,
  selectEducation,
  selectAdditionalQualifications,
  selectEducationDocuments,
  selectBoardOptions,
  selectBoardsLoading,
  selectHospitalOptions,
  selectHospitalsLoading,
  fetchBoardOptions,
  fetchHospitalOptions,
  updateEducation,
  setAdditionalQualifications,
  updateEducationDocument,
  setEducationDocuments,
  setApplicationId,
} from "@/store/slices";
import { AdditionalQualificationState, DocumentRowState } from "../registrationState";
import { validateEducation, validateEducationDocuments, validateAdditionalQualifications } from "../validators";
import { saveFreshApplication } from "@/services/authService";
import { loadUser } from "@/lib/auth/cookieStorage";
import { validatePdfFile } from "../pdfValidation";
import EducationSscHscSection from "../forms/EducationSscHscSection";
import EducationQualificationSection from "../forms/EducationQualificationSection";
import EducationAdditionalSection from "../forms/EducationAdditionalSection";
import EducationDetailsFooter from "../forms/EducationDetailsFooter";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function toMonthYear(val: string | null | undefined): string {
  if (!val) return "";

  // "YYYY-MM[anything]" → "Month YYYY"
  if (/^\d{4}-\d{2}/.test(val)) {
    const [y, m] = val.split("-").map(Number);
    if (y && m >= 1 && m <= 12) return `${MONTH_NAMES[m - 1]} ${y}`;
  }

  // "MonthName YYYY[garbage]" → clean "Month YYYY"
  const spaceIdx = val.indexOf(" ");
  if (spaceIdx > 0) {
    const monthPart = val.substring(0, spaceIdx);
    const year = parseInt(val.substring(spaceIdx + 1), 10);
    const monthIdx = MONTH_NAMES.findIndex(
      (n) => n.toLowerCase() === monthPart.toLowerCase(),
    );
    if (monthIdx !== -1 && !isNaN(year) && year > 1900) {
      return `${MONTH_NAMES[monthIdx]} ${year}`;
    }
  }

  return val;
}

interface EducationDetailsStepProps {
  onBack: () => void;
  onContinue: () => void;
  validationTrigger?: number;
  onScrollToTop?: () => void;
}

function buildEducationPayload(
  form: ReturnType<typeof selectEducation>,
  additional: AdditionalQualificationState[],
  educationDocuments: DocumentRowState[],
) {
  const authUser = loadUser();

  // Only include documents the user actively uploaded in this session (have a File object)
  const newlyUploadedDocs = educationDocuments.filter((doc) => !!doc.fileObject);

  const educationalDetails = {
    ssc_school_name: form.sscSchool,
    ssc_passed_year: toMonthYear(form.sscYear),
    ssc_board_uuid: form.sscBoard,
    hsc_school_name: form.hscSchool,
    hsc_passed_year: toMonthYear(form.hscYear),
    hsc_board_uuid: form.hscBoard,
    qualification_uuid: form.qualificationId,
    college_institution_code: form.institutionCode,
    college_uuid: form.collegeId,
    college_name: form.college,
    college_joining_year: toMonthYear(form.joiningYear),
    college_passed_year: toMonthYear(form.passedYear),
    hospital_uuid: form.hospital,
    additional_qualifications: additional
      .filter((q) => q.qualificationId || q.institutionCode || q.collegeId)
      .map((q) => ({
        additional_qualification_uuid: q.qualificationId ?? "",
        additional_college_institution_code: q.institutionCode ?? "",
        additional_college_uuid: q.collegeId ?? "",
        additional_college_name: q.college ?? "",
      })),
    ...(newlyUploadedDocs.length > 0 && {
      educational_documents: newlyUploadedDocs.map((doc) => ({
        id: doc.id,
        name: doc.name,
        fileName: doc.fileName ?? doc.name,
        source: "MANUAL",
        qualification_document_uuid: doc.qualificationDocumentUuid ?? doc.uuid,
      })),
    }),
  };

  const formData = new FormData();
  formData.append("user_uuid", authUser?.id ?? "");
  formData.append("educational_details", JSON.stringify(educationalDetails));
  newlyUploadedDocs.forEach((doc) => {
    formData.append(`file_${doc.id}`, doc.fileObject!, doc.fileName ?? doc.name);
  });

  return formData;
}

export default function EducationDetailsStep({ onBack, onContinue, validationTrigger, onScrollToTop }: EducationDetailsStepProps) {
  const dispatch = useAppDispatch();
  const form = useAppSelector(selectEducation);
  const additional = useAppSelector(selectAdditionalQualifications);
  const educationDocuments = useAppSelector(selectEducationDocuments);
  const boardOptions = useAppSelector(selectBoardOptions);
  const loadingBoards = useAppSelector(selectBoardsLoading);
  const hospitalOptions = useAppSelector(selectHospitalOptions);
  const loadingHospitals = useAppSelector(selectHospitalsLoading);
  const toast = useRef<Toast>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [additionalErrors, setAdditionalErrors] = useState<Record<number, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (boardOptions.length === 0 && !loadingBoards) {
      dispatch(fetchBoardOptions());
    }
    if (hospitalOptions.length === 0 && !loadingHospitals) {
      dispatch(fetchHospitalOptions());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!validationTrigger) return;
    const educationErrors = validateEducation(form);
    const documentErrors = validateEducationDocuments(educationDocuments);
    const addlErrors = validateAdditionalQualifications(additional);
    setErrors({ ...educationErrors, ...documentErrors });
    setAdditionalErrors(addlErrors);
    onScrollToTop?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationTrigger]);

  const update = (key: keyof typeof form, value: string) => {
    dispatch(updateEducation({ [key]: value } as Partial<typeof form>));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const addQualification = () => {
    dispatch(
      setAdditionalQualifications([
        ...additional,
        {
          id: Date.now(),
          qualification: null,
          qualificationId: null,
          institutionCode: null,
          college: null,
          collegeId: null,
          documents: [],
        },
      ]),
    );
  };

  const removeQualification = (id: number) => {
    dispatch(setAdditionalQualifications(additional.filter((q) => q.id !== id)));
  };

  const updateAdditional = (
    id: number,
    patch: Partial<Omit<AdditionalQualificationState, "id">>,
  ) => {
    dispatch(
      setAdditionalQualifications(
        additional.map((q) => (q.id === id ? { ...q, ...patch } : q)),
      ),
    );
  };

  const handleContinue = useCallback(async () => {
    // 1. Client-side validation
    const educationErrors = validateEducation(form);
    const documentErrors = validateEducationDocuments(educationDocuments);
    const addlErrors = validateAdditionalQualifications(additional);
    const allErrors = { ...educationErrors, ...documentErrors };
    const hasAddlErrors = Object.keys(addlErrors).length > 0;

    if (Object.keys(allErrors).length > 0 || hasAddlErrors) {
      setErrors(allErrors);
      setAdditionalErrors(addlErrors);
      onScrollToTop?.();
      const messages = [];
      if (Object.keys(educationErrors).length > 0 || hasAddlErrors)
        messages.push("Please fill in all required fields.");
      if (documentErrors.educationDocuments) messages.push(documentErrors.educationDocuments);
      messages.forEach((detail) =>
        toast.current?.show({ severity: "error", summary: "Validation Error", detail, life: 5000 })
      );
      return;
    }
    setErrors({});
    setAdditionalErrors({});

    // 2. Call API
    setIsLoading(true);
    try {
      const payload = buildEducationPayload(form, additional, educationDocuments);
      const response = await saveFreshApplication(payload);

      // 3. Persist applicationId if returned (needed before dashboard API loads)
      const applicationId: string | undefined =
        response?.data?.fresh_application_uuid ??
        response?.data?.personalDetails?.uuid ??
        response?.personalDetails?.uuid
      if (applicationId) {
        dispatch(setApplicationId(applicationId));
      }

      // 4. Advance to Communication step
      onContinue();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        "Failed to save education details. Please try again.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [form, additional, educationDocuments, onContinue]);

  return (
    <div className="prts-education-wrapper">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-education-card">
        <div className="prts-step-content">
          <div className="prts-step-content__header">
            <h1 className="prts-step-content__title">Education Details</h1>
            <p className="prts-step-content__desc">
              Please enter your academic and professional qualification details carefully, including SSC, HSC, diploma, or pharmacy education information.

              <br />
              <br />
              Ensure all details match your official certificates and mark sheets to avoid verification delays.

            </p>
          </div>

          <div className="prts-personal-accordion-group">
            <EducationSscHscSection
              form={form}
              errors={errors}
              onUpdate={update}
              boardOptions={boardOptions}
              loadingBoards={loadingBoards}
            />
            <EducationQualificationSection
              form={form}
              errors={errors}
              onUpdate={update}
              hospitalOptions={hospitalOptions}
              loadingHospitals={loadingHospitals}
              documents={educationDocuments}
              onDocumentUpdate={(id, patch) => {
                dispatch(updateEducationDocument({ id, patch }));
                if (errors.educationDocuments) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.educationDocuments;
                    return next;
                  });
                }
              }}
              onDocumentValidate={validatePdfFile}
              onDocumentValidationError={(msg) => toast.current?.show({ severity: "error", summary: "Invalid File", detail: msg, life: 6000 })}
              onDocumentsReplaced={(docs: DocumentRowState[]) => {
                dispatch(setEducationDocuments(docs));
              }}
            />
          </div>

          <EducationAdditionalSection
            items={additional}
            mainQualificationId={form.qualificationId}
            onAdd={addQualification}
            onRemove={removeQualification}
            onUpdate={updateAdditional}
            additionalErrors={additionalErrors}
            onClearAdditionalError={(id, field) =>
              setAdditionalErrors((prev) => {
                if (!prev[id]) return prev;
                const next = { ...prev, [id]: { ...prev[id] } };
                delete next[id][field];
                if (Object.keys(next[id]).length === 0) delete next[id];
                return next;
              })
            }
          />
        </div>
      </div>

      <div className="prts-education-footer">
        <EducationDetailsFooter
          onReset={() => {
            dispatch(resetEducationSection());
            setErrors({});
          }}
          onBack={onBack}
          onContinue={handleContinue}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
