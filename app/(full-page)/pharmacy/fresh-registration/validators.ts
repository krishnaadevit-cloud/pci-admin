// Validation utilities for registration form

export interface ValidationError {
  [key: string]: string;
}

export interface AddressFieldErrors {
  address?: string;
  pinCode?: string;
  state?: string;
  district?: string;
  city?: string;
}

export const extractAddressErrors = (errors: ValidationError, prefix: string): AddressFieldErrors => ({
  address: errors[`${prefix}Address`],
  pinCode: errors[`${prefix}PinCode`],
  state: errors[`${prefix}State`],
  district: errors[`${prefix}District`],
  city: errors[`${prefix}City`],
});

// Email regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mobile number regex — 10 digits, must start with 6, 7, 8, or 9 (Indian numbers)
const MOBILE_REGEX = /^[6-9][0-9]{9}$/;

// Pincode regex (6 digits)
const PINCODE_REGEX = /^[0-9]{6}$/;

export const validatePersonal = (personal: any): ValidationError => {
  const errors: ValidationError = {};

  if (!personal.fullName?.trim()) errors.fullName = "Full name is required";
  if (!personal.gender) errors.gender = "Gender is required";
  if (!personal.dob) errors.dob = "Date of birth is required";
  if (!personal.birthPlace?.trim()) errors.birthPlace = "Birth place is required";
  if (!personal.bloodGroup) errors.bloodGroup = "Blood group is required";
  if (!personal.nationality?.trim()) errors.nationality = "Nationality is required";
  if (!personal.religion) errors.religion = "Religion is required";
  if (!personal.category) errors.category = "Category is required";

  if (!personal.mobile?.trim()) {
    errors.mobile = "Mobile number is required";
  } else if (personal.mobile.length < 10) {
    errors.mobile = "Mobile number must be exactly 10 digits";
  } else if (!MOBILE_REGEX.test(personal.mobile)) {
    errors.mobile = "Mobile number must be a valid 10-digit number";
  }

  if (personal.altMobile?.trim()) {
    if (personal.altMobile.length < 10) {
      errors.altMobile = "Alternate mobile number must be exactly 10 digits";
    } else if (!MOBILE_REGEX.test(personal.altMobile)) {
      errors.altMobile = "Alternate mobile must be a valid 10-digit number";
    } else if (personal.altMobile === personal.mobile?.trim()) {
      errors.altMobile = "Alternate mobile must be different from your primary mobile number";
    }
  }

  if (!personal.email?.trim()) {
    errors.email = "Email address is required";
  } else if (!EMAIL_REGEX.test(personal.email)) {
    errors.email = "Please enter a valid email address";
  }

  return errors;
};

const MONTH_NAMES_V = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function parseYM(value: string): number | null {
  if (!value) return null;

  // "YYYY-MM" format
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split("-").map(Number);
    if (!y || !m) return null;
    return y * 100 + m;
  }

  // "Month YYYY" format (e.g. "July 2010")
  const parts = value.trim().split(/\s+/);
  if (parts.length === 2) {
    const monthIdx = MONTH_NAMES_V.indexOf(parts[0].toLowerCase());
    const year = parseInt(parts[1], 10);
    if (monthIdx !== -1 && !isNaN(year)) return year * 100 + (monthIdx + 1);
  }

  return null;
}

export const validateEducation = (education: any): ValidationError => {
  const errors: ValidationError = {};

  if (!education.sscSchool?.trim()) errors.sscSchool = "SSC School name is required";
  if (!education.sscBoard) errors.sscBoard = "SSC Board is required";
  if (!education.sscYear) errors.sscYear = "SSC passing year is required";

  if (!education.hscSchool?.trim()) errors.hscSchool = "HSC School name is required";
  if (!education.hscBoard) errors.hscBoard = "HSC Board is required";
  if (!education.hscYear) {
    errors.hscYear = "HSC passing year is required";
  } else if (education.sscYear) {
    const ssc = parseYM(education.sscYear);
    const hsc = parseYM(education.hscYear);
    if (ssc !== null && hsc !== null && hsc < ssc) {
      errors.hscYear = "HSC passing year cannot be before SSC passing year";
    }
  }

  if (!education.qualification) errors.qualification = "Qualification is required";
  if (!education.institutionCode?.trim()) errors.institutionCode = "Institution code is required";
  if (!education.collegeId?.trim()) errors.college = "Please select a college / institute";

  if (!education.joiningYear) {
    errors.joiningYear = "College joining year is required";
  } else if (education.hscYear) {
    const hsc = parseYM(education.hscYear);
    const joining = parseYM(education.joiningYear);
    if (hsc !== null && joining !== null && joining < hsc) {
      errors.joiningYear = "Joining year cannot be before HSC passing year";
    }
  }

  if (!education.passedYear) {
    errors.passedYear = "College passing year is required";
  } else if (education.joiningYear) {
    const joining = parseYM(education.joiningYear);
    const passed = parseYM(education.passedYear);
    if (joining !== null && passed !== null && passed <= joining) {
      errors.passedYear = "Passed year must be after joining year";
    }
  }

  if (!education.hospital?.trim()) errors.hospital = "Hospital/Internship place is required";

  return errors;
};

export const validateCommunication = (communication: any): ValidationError => {
  const errors: ValidationError = {};

  const validateAddress = (address: any, prefix: string) => {
    const addressErrors: ValidationError = {};
    if (!address.address?.trim()) addressErrors[`${prefix}Address`] = "Address is required";
    if (!address.pinCode?.trim()) {
      addressErrors[`${prefix}PinCode`] = "Pin code is required";
    } else if (!PINCODE_REGEX.test(address.pinCode)) {
      addressErrors[`${prefix}PinCode`] = "Pin code should be 6 digits";
    }
    if (!address.state?.trim()) addressErrors[`${prefix}State`] = "State is required";
    if (!address.district?.trim()) addressErrors[`${prefix}District`] = "District is required";
    if (!address.city?.trim()) addressErrors[`${prefix}City`] = "City is required";
    return addressErrors;
  };

  const permanentErrors = validateAddress(communication.permanent, "permanent");
  const correspondenceErrors = validateAddress(communication.correspondence, "correspondence");
  const professionalErrors = validateAddress(communication.professional, "professional");

  Object.assign(errors, permanentErrors, correspondenceErrors, professionalErrors);

  if (!communication.agreedToTerms) {
    errors.agreedToTerms = "You must agree to the terms and conditions";
  }

  return errors;
};

export const validateEducationDocuments = (documents: any[]): ValidationError => {
  const errors: ValidationError = {};

  // Documents are loaded dynamically from the API after qualification is selected.
  // If the list is empty (no qualification selected or qualification has no docs), skip validation.
  if (documents.length === 0) return errors;

  if (documents.some((d) => d.status === "uploading")) {
    errors.educationDocuments = "Please wait for all document uploads to finish";
    return errors;
  }

  if (documents.some((d) => d.status === "failed")) {
    errors.educationDocuments = "Please fix the failed document uploads before proceeding";
    return errors;
  }

  const pending = documents.filter((d) => d.status !== "uploaded");
  if (pending.length > 0) {
    errors.educationDocuments = `Please upload all required documents (${pending.length} remaining)`;
  }

  return errors;
};

export const validateAdditionalQualifications = (
  additional: any[],
): Record<number, ValidationError> => {
  const errors: Record<number, ValidationError> = {};

  additional.forEach((item) => {
    if (!item.qualificationId) return;
    const cardErrors: ValidationError = {};
    if (!item.institutionCode?.trim()) cardErrors.institutionCode = "Institution code is required";
    if (!item.collegeId?.trim()) cardErrors.college = "College / Institute Name is required";
    if (Object.keys(cardErrors).length > 0) errors[item.id] = cardErrors;
  });

  return errors;
};

export const validateDocuments = (documents: any[]): ValidationError => {
  const errors: ValidationError = {};
  const uploadedDocs = documents.filter((d) => d.status === "uploaded").length;
  const failedDocs = documents.filter((d) => d.status === "failed").length;

  if (uploadedDocs === 0) {
    errors.documents = "At least one document must be uploaded";
  }

  if (failedDocs > 0) {
    errors.documents = "Please fix failed document uploads";
  }

  // return errors;
   return {};
};
