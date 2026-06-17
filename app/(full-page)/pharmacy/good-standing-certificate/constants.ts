export const GOOD_STANDING_CERTIFICATE_STEPS = [
  { id: 1, label: "Review Personal Details" },
  { id: 2, label: "Pharmacist References" },
  { id: 3, label: "Documents Upload" },
];

export interface PharmacistReference {
  registrationNo: string;
  fullName: string;
  address: string;
}
