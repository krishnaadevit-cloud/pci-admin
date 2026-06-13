import { USER_BASE_URL } from '../appConfig/Settings';
import { createService } from './GlobalProductService';

export const { getAllDetails, deleteData, deleteAllData, postData, patchData, changeUserStatus,getById } = createService(USER_BASE_URL);
