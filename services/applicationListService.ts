import { getAllDetails } from '@/service/ApplicationService';
import { PHARMACY_APPLICATION_LIST } from '@/config/ApiConstant';

export async function fetchApplicationList() {
  try {
    return await getAllDetails(PHARMACY_APPLICATION_LIST);
  } catch (error) {
    throw error;
  }
}
