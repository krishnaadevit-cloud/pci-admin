export interface ApplicationStatus {
  fresh_status: boolean;
  renewal_status: boolean;
  reentry_status: boolean;
  degree_add_status: boolean;
  address_change_status: boolean;
  name_change_status: boolean;
  good_standing_status: boolean;
  duplicate_certi_status: boolean;
  eligible_status: boolean;
  reg_cancel: boolean;
}

export type FreshApplicationStatus =
  | "INITIAL"
  | "PAYMENT_FAILED"
  | "PENDING"
  | "UNDER_SCRUTINY"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED";

export interface OtherDocument {
  uuid: string | null;
  document_uuid: string | null;
  document_name: string | null;
  is_required: boolean;
  source: string | null;
  s3_object_key: string | null;
  digilocker_uri: string | null;
  download_url: string | null;
  document_verification_status: boolean;
}

export interface EducationalDocument {
  uuid: string | null;
  qualification_document_id: string | null;
  qualification_document_uuid: string | null;
  document_name: string | null;
  is_required: boolean;
  source: string | null;
  s3_object_key: string | null;
  digilocker_uri: string | null;
  download_url: string | null;
  document_verification_status: boolean;
}

export interface FreshRegistrationDetails {
  personalDetails: {
    uuid: string;
    surname: string;
    firstName: string;
    middleName: string | null;
    email: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    birthDate: string;
    birthPlace: string | null;
    nationality: string | null;
    panCard: string | null;
    aadharCard: string | null;
    bloodGroup: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-" | null;
    religion: string | null;
    category: string | null;
    mobileNo: string | null;
    alternateMobileNo: string | null;
    applicationType: string;
    validity: string | null;
    registrationDate: string | null;
    profileImage: string | null;
    fileNo: string | null;
    status: FreshApplicationStatus;
    appliedOn: string | null;
    regNo: string | null;
    validityDate: string | null;
    approvedByName: string | null;
    approvedByUuid: string | null;
    isOriginal: number | null;
    provisionalGenerateDate: string | null;
    originalGenerateDate: string | null;
    newFullName: string | null;
    applicationName: string | null;
  };
  aadhaarVerified: boolean;
  aadhaarResponse: unknown | null;
  educationalDetails: Record<string, unknown> | null;
  communicationDetails: Record<string, unknown> | null;
  educationalDocuments: EducationalDocument[];
  otherDocuments: OtherDocument[];
}

export interface OtherApplication {
  uuid: string;
  userUuid: string;
  applicationUuid: string;
  applicationName: string | null;
  freshApplicationUuid: string | null;
  status: FreshApplicationStatus;
  freshApplication: {
    surname: string;
    firstName: string;
    middleName: string | null;
    email: string;
    registrationDate: string | null;
  } | null;
  renewal_details?: {
    renewal_period: number;
    employment_status: number | null;
    designation: string | null;
    organization_name: string | null;
    employment_file_url: string[];
  };
  name_change_details?: {
    old_full_name: string | null;
    new_full_name: string | null;
  };
  address_change_details?: {
    old_address: unknown | null;
    address: string | null;
    pincode: string | null;
    state: string | null;
    city: string | null;
  };
  degree_addition_details?: {
    new_qualification_uuid: string | null;
    institute_pci_code: string | null;
    college_name: string | null;
    joining_year: string | null;
    passing_year: string | null;
    hospital_master_uuid: string | null;
    educational_documents?: EducationalDocument[];
  };
  other_documents: OtherDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  application_status: ApplicationStatus;
  fresh_application_uuid: string | null;
  fresh_app_details: FreshRegistrationDetails | null;
  renewal_details: OtherApplication | null;
  reentry_details: OtherApplication | null;
  degree_add_details: OtherApplication | null;
  address_change_details: OtherApplication | null;
  name_change_details: OtherApplication | null;
  duplicate_certi_details: OtherApplication | null;
}
