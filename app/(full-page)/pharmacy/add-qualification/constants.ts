import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";

export const ADD_QUAL_STEPS = [
  { id: 1, label: "Review Qualification Details" },
  { id: 2, label: "Add New Qualification Details" },
  { id: 3, label: "Documents Upload" },
];

export interface QualForm {
  qualificationId: string;
  qualification: string;
  institutionCode: string;
  college: string;
  collegeId: string;
  joiningYear: string;
  passedYear: string;
  hospital: string;
}

export const INITIAL_QUAL_FORM: QualForm = {
  qualificationId: "",
  qualification: "",
  institutionCode: "",
  college: "",
  collegeId: "",
  joiningYear: "",
  passedYear: "",
  hospital: "",
};

export const ADD_QUAL_DOCUMENT_LIST: DocumentRowState[] = [
  { id: 1, name: "Application Form", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 2, name: "Previous Registration Certificate", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 3, name: "Identity Proof (Aadhaar / PAN Card)", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 4, name: "Address Proof", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 5, name: "Qualification Certificate", status: "pending", isRequired: true, digiFetchDisabled: false },
];

export const ADD_QUAL_MOCK_FEE_STRUCTURE = [
  { label: "Qualification Addition Fee", value: 800 },
  { label: "Processing Fee", value: 200 },
  { label: "GST (18%)", value: 180 },
];

export const ADD_QUAL_MOCK_FEE_TOTAL = 1180;
