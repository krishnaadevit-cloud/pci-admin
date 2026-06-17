import { getAllDetails } from '@/service/ApplicationService';
import { PHARMACY_CERTIFICATE_LIST } from '@/config/ApiConstant';

export async function fetchCertificateList() {
  try {
    return await getAllDetails(PHARMACY_CERTIFICATE_LIST);
  } catch (error) {
    throw error;
  }
}
