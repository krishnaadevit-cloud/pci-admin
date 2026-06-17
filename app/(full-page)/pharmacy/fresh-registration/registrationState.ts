import {
  MOCK_AADHAAR_DATA,
  EDUCATION_DOCUMENT_LIST,
  BloodGroupEnum,
} from "./constants";

export type DocumentUploadStatus = "pending" | "uploaded" | "uploading" | "failed";

export interface DocumentRowState {
  id: number;
  uuid?: string;
  documentId?: string;
  qualificationDocumentUuid?: string;
  name: string;
  status: DocumentUploadStatus;
  fileName?: string;
  fileSize?: string;
  digiFetchDisabled?: boolean;
  selected?: boolean;
  isRequired?: boolean;
  downloadUrl?: string;
  fileObject?: File;
  source?: 'MANUAL' | 'DIGILOCKER';
  digilockerUri?: string;
}

export interface PersonalState {
  fullName: string;
  gender: string;
  dob: Date | string | null;
  birthPlace: string;
  bloodGroup: string;
  nationality: string;
  religion: string;
  category: string;
  pan: string;
  aadhaar: string;
  mobile: string;
  altMobile: string;
  email: string;
  aadhaarVerified: boolean;
}

export interface EducationState {
  sscSchool: string;
  sscBoard: string;
  sscYear: Date | string | null;
  hscSchool: string;
  hscBoard: string;
  hscYear: Date | string | null;
  qualification: string;
  qualificationId: string;
  institutionCode: string;
  college: string;
  collegeId: string;
  joiningYear: Date | string | null;
  passedYear: Date | string | null;
  hospital: string;
}

export interface AdditionalQualificationState {
  id: number;
  qualification: string | null;
  qualificationId: string | null;
  institutionCode: string | null;
  college: string | null;
  collegeId: string | null;
  documents: DocumentRowState[];
}

export interface AddressState {
  address: string;
  state: string;
  district: string;
  taluka: string;
  city: string;
  pinCode: string;
}

export interface CommunicationState {
  permanent: AddressState;
  correspondence: AddressState;
  professional: AddressState;
  agreedToTerms: boolean;
}

/** Full registration payload — ready to POST to your API later */
export interface RegistrationFormState {
  applicationId: string;
  personal: PersonalState;
  education: EducationState;
  additionalQualifications: AdditionalQualificationState[];
  communication: CommunicationState;
  educationDocuments: DocumentRowState[];
  documents: DocumentRowState[];
}

export const MAX_DOCUMENT_BYTES = 1 * 1024 * 1024;
export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf"];

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDobPreview(d: Date | string | null): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function formatMonthYearPreview(d: Date | string | null): string {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", { month: "long", year: "numeric" });
}

function cloneEducationDocuments(): DocumentRowState[] {
  return EDUCATION_DOCUMENT_LIST.map((row) => ({ ...row }));
}

const blankAddress: AddressState = {
  address: "",
  state: "",
  district: "",
  taluka: "",
  city: "",
  pinCode: "",
};

export function createInitialRegistrationState(): RegistrationFormState {
  return {
    applicationId: "",
    personal: createBlankPersonal(false),
    education: createBlankEducation(),
    additionalQualifications: [
      { id: 1, qualification: null, qualificationId: null, institutionCode: null, college: null, collegeId: null, documents: [] },
    ],
    communication: {
      permanent: { ...blankAddress },
      correspondence: { ...blankAddress },
      professional: { ...blankAddress },
      agreedToTerms: false,
    },
    educationDocuments: cloneEducationDocuments(),
    documents: [],
  };
}

export function createBlankEducation(): EducationState {
  return {
    sscSchool: "",
    sscBoard: "",
    sscYear: null,
    hscSchool: "",
    hscBoard: "",
    hscYear: null,
    qualification: "",
    qualificationId: "",
    institutionCode: "",
    college: "",
    collegeId: "",
    joiningYear: null,
    passedYear: null,
    hospital: "",
  };
}

export function createBlankPersonal(keepAadhaar: boolean): PersonalState {
  return {
    fullName: "",
    gender: "",
    dob: null,
    birthPlace: "",
    bloodGroup: "",
    nationality: "Indian",
    religion: "",
    category: "",
    pan: "",
    aadhaar: keepAadhaar ? MOCK_AADHAAR_DATA.aadhaarNumber : "656545844220",
    mobile: "",
    altMobile: "",
    email: "",
    aadhaarVerified: false,
  };
}

/** Strip `File` blobs before JSON / API — upload files via multipart separately */
export function registrationToSerializablePayload(r: RegistrationFormState) {
  return {
    applicationId: r.applicationId,
    personal: r.personal,
    education: r.education,
    additionalQualifications: r.additionalQualifications.map((q) => ({
      ...q,
      documents: q.documents.map(({ fileObject: _f, ...rest }) => rest),
    })),
    communication: r.communication,
    educationDocuments: r.educationDocuments.map(({ fileObject: _f, ...rest }) => rest),
    documents: r.documents.map(({ fileObject: _f, ...rest }) => rest),
  };
}
