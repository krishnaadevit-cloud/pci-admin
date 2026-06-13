import { SCRUTINY_CONFIG_GET, SCRUTINY_CONFIG_SAVE } from '@/config/ApiConstant';
import { getAllDetails, postData } from '@/service/PharmacyApplication_Service';

// Uses PharmacyApplication_Service (base: /proxy/v1/application) — same as
// the fresh-application list.

export interface ScrutinyStepApiItem {
  uuid: string;
  stepNumber: number;
  stepName: string;
  roleUuid: string;
  userUuids: string[];
  isActive: boolean;
}

export interface ScrutinyConfigApiResponse {
  applicationUuid: string;
  steps: ScrutinyStepApiItem[];
}

export interface ScrutinyConfigSavePayload {
  applicationUuid: string;
  steps: Array<{
    stepNumber: number;
    stepName: string;
    roleUuid: string;
    userUuids: string[];
  }>;
}

export async function getScrutinyConfig(
  applicationUuid: string,
): Promise<ScrutinyConfigApiResponse> {
  // getAllDetails returns response.data.data
  return getAllDetails(`${SCRUTINY_CONFIG_GET}?applicationUuid=${encodeURIComponent(applicationUuid)}`);
}

export async function saveScrutinyConfig(
  payload: ScrutinyConfigSavePayload,
): Promise<ScrutinyConfigApiResponse> {
  // postData returns response.data — extract the nested data field
  const result = await postData(SCRUTINY_CONFIG_SAVE, payload);
  return result?.data ?? result;
}
