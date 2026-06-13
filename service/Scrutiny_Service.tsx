import { SCRUTINY_BASE_URL } from '../appConfig/Settings';
import { createService } from './GlobalProductService';

export const { getWithParams, getById, postData } = createService(SCRUTINY_BASE_URL);
