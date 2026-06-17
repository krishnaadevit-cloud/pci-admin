// /**
//  * Custom selectors for Fresh Registration Module
//  * 
//  * These selectors provide a clean, memoized way to access
//  * freshRegistration state from components.
//  * 
//  * Usage:
//  * const personal = useAppSelector(selectPersonal);
//  */

// import { RootState } from "@/store/store";

// // Personal Details Selectors
// export const selectPersonal = (state: RootState) =>
//   state.freshRegistration.registration.personal;

// export const selectPersonalAadhaar = (state: RootState) =>
//   state.freshRegistration.registration.personal.aadhaar;

// export const selectPersonalMobile = (state: RootState) =>
//   state.freshRegistration.registration.personal.mobile;

// // Education Details Selectors
// export const selectEducation = (state: RootState) =>
//   state.freshRegistration.registration.education;

// export const selectAdditionalQualifications = (state: RootState) =>
//   state.freshRegistration.registration.additionalQualifications;

// // Communication Details Selectors
// export const selectCommunication = (state: RootState) =>
//   state.freshRegistration.registration.communication;

// export const selectPermanentAddress = (state: RootState) =>
//   state.freshRegistration.registration.communication.permanent;

// export const selectCorrespondenceAddress = (state: RootState) =>
//   state.freshRegistration.registration.communication.correspondence;

// export const selectProfessionalAddress = (state: RootState) =>
//   state.freshRegistration.registration.communication.professional;

// export const selectCommunicationAgreed = (state: RootState) =>
//   state.freshRegistration.registration.communication.agreedToTerms;

// // Education Documents Selectors
// export const selectEducationDocuments = (state: RootState) =>
//   state.freshRegistration.registration.educationDocuments;

// // Documents Selectors
// export const selectDocuments = (state: RootState) =>
//   state.freshRegistration.registration.documents;

// export const selectDocumentById = (state: RootState, id: number) =>
//   state.freshRegistration.registration.documents.find((d) => d.id === id);

// export const selectDocumentsWithStatus = (state: RootState, status: string) =>
//   state.freshRegistration.registration.documents.filter(
//     (d) => d.status === status
//   );

// // Form State Selectors
// export const selectApplicationId = (state: RootState) =>
//   state.freshRegistration.registration.applicationId;

// export const selectFullRegistration = (state: RootState) =>
//   state.freshRegistration.registration;

// // Step Navigation Selectors
// export const selectCurrentStep = (state: RootState) =>
//   state.freshRegistration.currentStep;

// // Loading & Error Selectors
// export const selectFreshRegistrationLoading = (state: RootState) =>
//   state.freshRegistration.isLoading;

// export const selectFreshRegistrationError = (state: RootState) =>
//   state.freshRegistration.error;

// // Computed Selectors (useful for components)
// export const selectIsFormComplete = (state: RootState) => {
//   const form = state.freshRegistration.registration;
//   return (
//     form.personal.aadhaar &&
//     form.education.qualification &&
//     form.educationDocuments.every((d) => !d.isRequired || d.status === "uploaded") &&
//     form.communication.agreedToTerms &&
//     form.documents.every((d) => d.status === "uploaded")
//   );
// };

// export const selectDocumentUploadProgress = (state: RootState) => {
//   const documents = state.freshRegistration.registration.documents;
//   if (documents.length === 0) return 0;
//   const uploaded = documents.filter((d) => d.status === "uploaded").length;
//   return Math.round((uploaded / documents.length) * 100);
// };


import { RootState } from "@/store/store";
import {
  createBlankPersonal,
  createInitialRegistrationState,
  type CommunicationState,
  type EducationState,
  type RegistrationFormState,
} from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";

// -----------------------------
// Safe Default Objects
// -----------------------------

const initialRegistration = createInitialRegistrationState();

const defaultPersonal = createBlankPersonal(false);

const defaultEducation: EducationState = {
  ...initialRegistration.education,
  sscSchool: "",
  sscBoard: "",
  sscYear: null,
  hscSchool: "",
  hscBoard: "",
  hscYear: null,
  qualification: "",
  institutionCode: "",
  college: "",
  joiningYear: null,
  passedYear: null,
  hospital: "",
};

const defaultCommunication: CommunicationState = {
  ...initialRegistration.communication,
  agreedToTerms: false,
};

const defaultRegistration: RegistrationFormState = {
  applicationId: "",
  personal: defaultPersonal,
  education: defaultEducation,
  additionalQualifications: [],
  communication: defaultCommunication,
  educationDocuments: [],
  documents: [],
};

// -----------------------------
// Base Selector
// -----------------------------

export const selectFreshRegistrationState = (state: RootState) =>
  state?.freshRegistration ?? {};

export const selectRegistration = (state: RootState) =>
  state?.freshRegistration?.registration ?? defaultRegistration;

// -----------------------------
// Personal Details Selectors
// -----------------------------

export const selectPersonal = (state: RootState) =>
  selectRegistration(state)?.personal ?? defaultPersonal;

export const selectPersonalAadhaar = (state: RootState) =>
  selectPersonal(state)?.aadhaar ?? "";

export const selectPersonalMobile = (state: RootState) =>
  selectPersonal(state)?.mobile ?? "";

// -----------------------------
// Education Details Selectors
// -----------------------------

export const selectEducation = (state: RootState) =>
  selectRegistration(state)?.education ?? defaultEducation;

export const selectAdditionalQualifications = (state: RootState) =>
  selectRegistration(state)?.additionalQualifications ?? [];

// -----------------------------
// Communication Details Selectors
// -----------------------------

export const selectCommunication = (state: RootState) =>
  selectRegistration(state)?.communication ?? defaultCommunication;

export const selectPermanentAddress = (state: RootState) =>
  selectCommunication(state)?.permanent ?? {};

export const selectCorrespondenceAddress = (state: RootState) =>
  selectCommunication(state)?.correspondence ?? {};

export const selectProfessionalAddress = (state: RootState) =>
  selectCommunication(state)?.professional ?? {};

export const selectCommunicationAgreed = (state: RootState) =>
  selectCommunication(state)?.agreedToTerms ?? false;

// -----------------------------
// Education Documents Selectors
// -----------------------------

export const selectEducationDocuments = (state: RootState) =>
  selectRegistration(state)?.educationDocuments ?? [];

// -----------------------------
// Documents Selectors
// -----------------------------

export const selectDocuments = (state: RootState) =>
  selectRegistration(state)?.documents ?? [];

export const selectDocumentById = (state: RootState, id: number) =>
  selectDocuments(state)?.find((d: any) => d?.id === id) ?? null;

export const selectDocumentsWithStatus = (
  state: RootState,
  status: string
) =>
  selectDocuments(state)?.filter((d: any) => d?.status === status) ?? [];

// -----------------------------
// Form State Selectors
// -----------------------------

export const selectApplicationId = (state: RootState) =>
  selectRegistration(state)?.applicationId ?? "";

export const selectFullRegistration = (state: RootState) =>
  selectRegistration(state) ?? defaultRegistration;

// -----------------------------
// Step Navigation Selectors
// -----------------------------

export const selectCurrentStep = (state: RootState) =>
  state?.freshRegistration?.currentStep ?? 0;

// -----------------------------
// Loading & Error Selectors
// -----------------------------

export const selectFreshRegistrationLoading = (state: RootState) =>
  state?.freshRegistration?.isLoading ?? false;

export const selectFreshRegistrationError = (state: RootState) =>
  state?.freshRegistration?.error ?? null;

export const selectDashboardData = (state: RootState) =>
  state?.freshRegistration?.dashboardData ?? null;

export const selectPreviewData = (state: RootState) =>
  state?.freshRegistration?.previewData ?? null;

export const selectPreviewLoading = (state: RootState) =>
  state?.freshRegistration?.previewLoading ?? false;

export const selectBoardOptions = (state: RootState) =>
  state?.freshRegistration?.boardOptions ?? [];

export const selectBoardsLoading = (state: RootState) =>
  state?.freshRegistration?.boardsLoading ?? false;

export const selectHospitalOptions = (state: RootState) =>
  state?.freshRegistration?.hospitalOptions ?? [];

export const selectHospitalsLoading = (state: RootState) =>
  state?.freshRegistration?.hospitalsLoading ?? false;

export const selectApplicationList = (state: RootState) =>
  state?.freshRegistration?.applicationList ?? [];

export const selectApplicationListLoading = (state: RootState) =>
  state?.freshRegistration?.applicationListLoading ?? false;

export const selectFeePaymentList = (state: RootState) =>
  state?.freshRegistration?.feePaymentList ?? [];

export const selectFeePaymentListLoading = (state: RootState) =>
  state?.freshRegistration?.feePaymentListLoading ?? false;

export const selectCertificateList = (state: RootState) =>
  state?.freshRegistration?.certificateList ?? [];

export const selectCertificateListLoading = (state: RootState) =>
  state?.freshRegistration?.certificateListLoading ?? false;

export const selectSmartCardData = (state: RootState) =>
  state?.freshRegistration?.smartCardData ?? null;

export const selectSmartCardLoading = (state: RootState) =>
  state?.freshRegistration?.smartCardLoading ?? false;

// -----------------------------
// Computed Selectors
// -----------------------------

export const selectIsFormComplete = (state: RootState) => {
  const form = selectRegistration(state);

  return Boolean(
    form?.personal?.aadhaar &&
      form?.education?.qualification &&
      (form?.educationDocuments ?? []).every(
        (d: any) => !d?.isRequired || d?.status === "uploaded"
      ) &&
      form?.communication?.agreedToTerms &&
      (form?.documents ?? []).every(
        (d: any) => d?.status === "uploaded"
      )
  );
};

export const selectDocumentUploadProgress = (state: RootState) => {
  const documents = selectDocuments(state);

  if (!Array.isArray(documents) || documents.length === 0) {
    return 0;
  }

  const uploaded = documents.filter(
    (d: any) => d?.status === "uploaded"
  ).length;

  return Math.round((uploaded / documents.length) * 100);
};
