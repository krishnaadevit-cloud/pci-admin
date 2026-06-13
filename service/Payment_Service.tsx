import { PAYMENT_BASE_URL } from '../appConfig/Settings';
import { createService } from './GlobalProductService';

export const { postData, getAllDetails } = createService(PAYMENT_BASE_URL);
