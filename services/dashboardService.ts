import { getAllDetails } from '@/service/ApplicationService';
import { PHARMACY_DASHBOARD } from '@/config/ApiConstant';

export async function fetchDashboard() {
  try {
    return await getAllDetails(PHARMACY_DASHBOARD);
  } catch (error) {
    throw error;
  }
}
