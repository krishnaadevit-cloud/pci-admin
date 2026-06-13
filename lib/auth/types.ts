export type LoginMethod = "email" | "mobile_whatsapp";

export type PharmacistRegistered = "yes" | "no";

export interface PendingVerification {
  flow: "login" | "register";
  loginMethod?: LoginMethod;
  contactDisplay: string;
  email?: string;
  mobile?: string;
  whatsapp?: string;
  registrationData?: RegistrationDraft;
}

export interface RegistrationDraft {
  isPharmacistRegistered: PharmacistRegistered;
  registrationNumber?: string;
  fullName: string;
  stateCouncil: string;
  dateOfBirth?: string;
  email?: string;
  confirmEmail?: string;
  mobile?: string;
  whatsapp?: string;
  bhsNumber?: string;
}

export type UserType = "PHARMACIST" | "STATE_COUNCIL";

export interface AuthUser {
  id?: string;
  fullName: string;
  email?: string;
  mobile?: string;
  whatsapp?: string;
  stateCouncil?: string;
  registrationNumber?: string;
  isPharmacistRegistered: PharmacistRegistered;
  userType?: UserType;
}
