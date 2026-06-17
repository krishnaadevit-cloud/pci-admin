import { getAllDetails } from '@/service/ApplicationService';
import { PHARMACY_SMART_CARD } from '@/config/ApiConstant';

export async function fetchSmartCard() {
  try {
    return await getAllDetails(PHARMACY_SMART_CARD);
  } catch (error) {
    throw error;
  }
}
