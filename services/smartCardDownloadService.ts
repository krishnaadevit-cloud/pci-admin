import { postData } from '@/service/ApplicationService';
import { PHARMACY_SMART_CARD_DOWNLOAD } from '@/config/ApiConstant';

export async function downloadSmartCard(fileNo: string) {
  try {
    return await postData(PHARMACY_SMART_CARD_DOWNLOAD, { file_no: fileNo });
  } catch (error) {
    throw error;
  }
}
