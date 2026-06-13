// ─── Scrutiny Configuration data contract ────────────────────────────────────
//
// "Steps" here are the approval/workflow pipeline stages an application passes
// through — each stage owned by a role and assigned user(s). Decoupled from the
// question groups in `appConfig/scrutinyQuestions.ts` (those only bifurcate the
// applicant's data for display). The backend uses UUIDs throughout.

// The five application types that require scrutiny. Hardcoded by design.
export const SCRUTINY_APP_TYPES = [
  { code: 'FRESH-APPLICATION',            name: 'Fresh Application' },
  { code: 'FRESH-APPLICATION-OTHER-STATE', name: 'Fresh Application Other State' },
  { code: 'TRANSFER-IN',                  name: 'Transfer-In' },
  { code: 'DEGREE-ADDITION',              name: 'Degree Addition' },
  { code: 'RE-ENTRY',                     name: 'Re-Entry' },
] as const;

export type ScrutinyAppTypeCode = (typeof SCRUTINY_APP_TYPES)[number]['code'];

// Convert an MDM applicationName to the code format used above:
// "Fresh Application" → "FRESH-APPLICATION"
export function appNameToCode(name: string): string {
  return name.toUpperCase().replace(/ /g, '-');
}

export interface ScrutinyStepConfig {
  stepNumber: number;        // 1-based order in the pipeline
  roleUuid: string | null;   // UUID of the assigned role (roles.uuid)
  roleName?: string;         // denormalised for display only
  userUuids: string[];       // UUIDs of assigned users (users.uuid)
                             // non-final steps: ≥1; final step: exactly 1
}

// Shape sent to / received from the real bulk-save API
export interface ScrutinyAppConfig {
  applicationUuid: string;   // mst_application.uuid
  numberOfSteps: number;     // used locally; not sent to API
  steps: ScrutinyStepConfig[];
}

// A config is "complete" when ≥1 step exists and every step has a role + users.
export function isScrutinyConfigComplete(config?: ScrutinyAppConfig | null): boolean {
  if (!config || config.numberOfSteps < 1) return false;
  if (config.steps.length !== config.numberOfSteps) return false;
  return config.steps.every((step, index) => {
    if (!step.roleUuid) return false;
    const isLast = index === config.numberOfSteps - 1;
    return isLast ? step.userUuids.length === 1 : step.userUuids.length >= 1;
  });
}
