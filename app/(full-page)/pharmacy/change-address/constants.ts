import type { DocumentRowState } from "@/app/(full-page)/pharmacy/fresh-registration/registrationState";

export const CHANGE_ADDRESS_STEPS = [
  { id: 1, label: "Review Address Details" },
  { id: 2, label: "Change Address Details" },
  { id: 3, label: "Documents Upload" },
];

export const CHANGE_ADDRESS_DOCUMENT_LIST: DocumentRowState[] = [
  { id: 1, name: "Address Change Application Form", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 2, name: "New Address Proof (Aadhaar / Utility Bill)", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 3, name: "Previous Registration Certificate", status: "pending", isRequired: true, digiFetchDisabled: false },
  { id: 4, name: "Identity Proof (Aadhaar / PAN Card)", status: "pending", isRequired: true, digiFetchDisabled: false },
];

export const CHANGE_ADDRESS_MOCK_FEE_STRUCTURE = [
  { label: "Address Change Fee", value: 500 },
  { label: "Processing Fee", value: 200 },
  { label: "GST (18%)", value: 126 },
];

export const CHANGE_ADDRESS_MOCK_FEE_TOTAL = 826;
