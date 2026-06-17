import type { RegistrationFormState } from "./registrationState";
import {
  validatePersonal,
  validateEducation,
  validateEducationDocuments,
  validateCommunication,
  validateDocuments,
  type ValidationError,
} from "./validators";

export function validateRegistrationStep(
  stepId: number,
  registration: RegistrationFormState,
  options?: { ekycCompleted?: boolean },
): ValidationError {
  switch (stepId) {
    case 1:
      if (!options?.ekycCompleted && !registration.personal.aadhaarVerified && !registration.personal.aadhaar?.trim()) {
        return { ekyc: "Please complete E-KYC verification before continuing." };
      }
      return {};
    case 2:
      return validatePersonal(registration.personal);
    case 3:
      return {
        ...validateEducation(registration.education),
        ...validateEducationDocuments(registration.educationDocuments),
      };
    case 4:
      return validateCommunication(registration.communication);
    case 5:
      return validateDocuments(registration.documents);
    default:
      return {};
  }
}

export function getFirstValidationMessage(errors: ValidationError): string {
  const values = Object.values(errors);
  return values[0] ?? "Please complete the required fields.";
}

export function canNavigateToStep(
  targetStep: number,
  activeStep: number,
  registration: RegistrationFormState,
  completedSteps: number[],
): { allowed: boolean; errors: ValidationError; blockingStep?: number } {
  if (targetStep === activeStep) {
    return { allowed: true, errors: {} };
  }

  if (targetStep < activeStep) {
    return { allowed: true, errors: {} };
  }

  for (let step = activeStep; step < targetStep; step += 1) {
    const errors = validateRegistrationStep(step, registration, {
      ekycCompleted: completedSteps.includes(1),
    });
    if (Object.keys(errors).length > 0) {
      return { allowed: false, errors, blockingStep: step };
    }
  }

  return { allowed: true, errors: {} };
}
