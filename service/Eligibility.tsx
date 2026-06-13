


import { createService } from './GlobalProductService';
import { OFFICIAL_ELIGIBILITY_OTHER_STATE_BASE_URL } from '@/appConfig/Settings';

export const {  getWithParams ,getById  } = createService(OFFICIAL_ELIGIBILITY_OTHER_STATE_BASE_URL);
