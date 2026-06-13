import type { TenantReadiness } from '@/types/onboarding';
import { ONBOARDING_READINESS, ONBOARDING_TENANT_STATUS, REGISTRAR_SIGNATURE_UPLOAD } from '@/config/ApiConstant';
import { getAllDetails } from '@/service/PharmacyApplication_Service';
import { postData as postUserData } from '@/service/User_Service';
import { createAxios } from '@/config/axiosInstance';
import { PHARMACY_FRESH_APPLICATION_BASE_URL } from '@/appConfig/Settings';

// Uses PharmacyApplication_Service (base: /proxy/v1/application) — same as
// the fresh-application list. Constants are relative paths, e.g.
// 'onboarding/readiness' → /proxy/v1/application/onboarding/readiness

export async function getReadiness(): Promise<TenantReadiness> {
  // getAllDetails returns response.data.data (unwrapped from { success, message, data })
  return getAllDetails(ONBOARDING_READINESS);
}

export async function patchTenantStatus(): Promise<any> {
  const api = createAxios(PHARMACY_FRESH_APPLICATION_BASE_URL);
  const response = await api.patch(ONBOARDING_TENANT_STATUS);
  return response?.data?.data ?? response?.data;
}

export async function uploadRegistrarSignature(file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  const result = await postUserData(REGISTRAR_SIGNATURE_UPLOAD, formData);
  return result?.data ?? result;
}
