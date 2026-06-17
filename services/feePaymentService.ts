import { getAllDetails } from '@/service/ApplicationService';
import { PHARMACY_FEE_PAYMENT_LIST } from '@/config/ApiConstant';

export async function fetchFeePaymentList() {
  try {
    return await getAllDetails(PHARMACY_FEE_PAYMENT_LIST);
  } catch (error) {
    throw error;
  }
}
