import { REFRESHER_BASE_URL } from '../appConfig/Settings';
import { createService } from './GlobalProductService';

export const { getAllDetails, postData, getWithParams, deleteData } = createService(REFRESHER_BASE_URL);
