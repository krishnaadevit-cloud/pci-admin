import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";

export const RENEWAL_STEPS = [
  { id: 1, label: "Duration & Applicant Details" },
  { id: 2, label: "Employment Details" },
  { id: 3, label: "Document Upload" },
];

export const RENEWAL_DOCUMENT_LIST: DocumentRowState[] = [
  { id: 1, name: "Renewal Application Form", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 2, name: "Previous Registration Certificate", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 3, name: "Identity Proof (Aadhaar / PAN Card)", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 4, name: "Address Proof", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 5, name: "Qualification Certificate", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 6, name: "Employment Proof (if applicable)", status: "pending", isRequired: false, digiFetchDisabled: false },
];

export const RENEWAL_MOCK_FEE_STRUCTURE = [
  { label: "Renewal Fee", value: 1500 },
  { label: "Processing Fee", value: 200 },
  { label: "GST (18%)", value: 306 },
];

export const RENEWAL_MOCK_FEE_TOTAL = 2006;
