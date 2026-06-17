export const REGISTRATION_STEPS = [
  { id: 1, label: "E-KYC" },
  { id: 2, label: "Personal Details" },
  { id: 3, label: "Education Details" },
  { id: 4, label: "Communication Details" },
  { id: 5, label: "Document Upload" },
];

// Dummy Aadhaar used while E-KYC is skipped; replace with real value once E-KYC is live
export const MOCK_AADHAAR_DATA = {
  aadhaarNumber: "123456789012",
  fullName: "Arjun Ramesh Kapoor",
  dateOfBirth: "03 June 1999",
  gender: "Male",
  fatherName: "Ramesh Kapoor",
  address: "B-204, Shanti Nagar Society, Near Satellite Cross Roads",
};

export const NATIONALITY_OPTIONS = [
  { label: "Indian", value: "Indian" },
];

export const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

export enum BloodGroupEnum {
  A_POSITIVE  = 'A+',
  A_NEGATIVE  = 'A-',
  B_POSITIVE  = 'B+',
  B_NEGATIVE  = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE  = 'O+',
  O_NEGATIVE  = 'O-',
}

export const BLOOD_GROUP_OPTIONS = [
  { label: "A+",  value: BloodGroupEnum.A_POSITIVE  },
  { label: "A-",  value: BloodGroupEnum.A_NEGATIVE  },
  { label: "B+",  value: BloodGroupEnum.B_POSITIVE  },
  { label: "B-",  value: BloodGroupEnum.B_NEGATIVE  },
  { label: "O+",  value: BloodGroupEnum.O_POSITIVE  },
  { label: "O-",  value: BloodGroupEnum.O_NEGATIVE  },
  { label: "AB+", value: BloodGroupEnum.AB_POSITIVE },
  { label: "AB-", value: BloodGroupEnum.AB_NEGATIVE },
];

export const RELIGION_OPTIONS = [
  { label: "Hindu", value: "Hindu" },
  { label: "Muslim", value: "Muslim" },
  { label: "Christian", value: "Christian" },
  { label: "Sikh", value: "Sikh" },
  { label: "Other", value: "Other" },
];

export const CATEGORY_OPTIONS = [
  { label: "General", value: "General" },
  { label: "OBC/SEBC", value: "OBC/SEBC" },
  { label: "SC", value: "SC" },
  { label: "ST", value: "ST" },
];

export const BOARD_OPTIONS = [
  { label: "GSEB", value: "GSEB" },
  { label: "CBSE", value: "CBSE" },
  { label: "ICSE", value: "ICSE" },
];

export const EDUCATION_DOCUMENT_LIST: {
  id: number;
  name: string;
  status: "pending" | "uploaded" | "uploading" | "failed";
  fileName?: string;
  fileSize?: string;
  digiFetchDisabled?: boolean;
  isRequired?: boolean;
}[] = [
  {
    id: 1,
    name: "SSC Marksheet",
    status: "pending",
    isRequired: true,
  },
  {
    id: 2,
    name: "HSC Marksheet",
    status: "uploaded",
    isRequired: true,
    fileName: "hsc-marksheet.pdf",
    fileSize: "150 KB",
    digiFetchDisabled: true,
  },
  {
    id: 3,
    name: "D.Pharm First Year Marksheet",
    status: "pending",
    isRequired: true,
  },
  {
    id: 4,
    name: "D.Pharm Second Year Marksheet",
    status: "uploaded",
    isRequired: true,
    fileName: "dpharm-second-year-marksheet.pdf",
    fileSize: "200 KB",
  },
  {
    id: 5,
    name: "D.Pharm Final Year Marksheet",
    status: "failed",
    fileName: "dpharm-final-year-marksheet.pdf",
    fileSize: "250 KB",
    isRequired: true,
  },
  {
    id: 6,
    name: "D.Pharm Certificate (Both Side)",
    status: "pending",
    isRequired: true,
  },
];

export const HOSPITAL_OPTIONS = [
  { label: "APOLLO HOSPITAL INTERNATIONAL LTD GANDHINAGAR", value: "APOLLO HOSPITAL INTERNATIONAL LTD GANDHINAGAR" },
  { label: "HOSPITAL INTERNATIONAL ", value: "HOSPITAL INTERNATIONAL" },
  { label: "INTERNATIONAL LTD GANDHINAGAR", value: "INTERNATIONAL LTD GANDHINAGAR" },
];

