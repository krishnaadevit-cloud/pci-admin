import { PHARMACY_FRESH_APPLICATION_BASE_URL } from '../appConfig/Settings';
import { createService } from './GlobalProductService';

export const { getAllDetails, postData, patchData, deleteData } = createService(PHARMACY_FRESH_APPLICATION_BASE_URL);
