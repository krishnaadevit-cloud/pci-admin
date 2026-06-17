import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";

export const RE_ENTRY_STEPS = [
  { id: 1, label: "Review Applicant Details" },
  { id: 2, label: "Document Upload" },
];

export const RE_ENTRY_DOCUMENT_LIST: DocumentRowState[] = [
  { id: 1, name: "Re-Entry Application Form", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 2, name: "Previous Registration Certificate", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 3, name: "Identity Proof (Aadhaar / PAN Card)", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 4, name: "Address Proof", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 5, name: "Qualification Certificate", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 6, name: "NOC / Relieving Letter (if applicable)", status: "pending", isRequired: false, digiFetchDisabled: false },
];

export const RE_ENTRY_MOCK_FEE_STRUCTURE = [
  { label: "Re-Entry Fee", value: 1200 },
  { label: "Processing Fee", value: 200 },
  { label: "GST (18%)", value: 252 },
];

export const RE_ENTRY_MOCK_FEE_TOTAL = 1652;
