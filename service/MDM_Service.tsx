import { MDM_BASE_URL } from '../appConfig/Settings';
import { createService } from './GlobalProductService';

export const { getAllDetails, deleteData, deleteAllData, postData, patchData, changeUserStatus, getCitiesByState } = createService(MDM_BASE_URL);

