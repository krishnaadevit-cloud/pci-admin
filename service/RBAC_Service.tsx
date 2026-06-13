import { RBAC_BASE_URL } from '../appConfig/Settings';
import { createService } from './GlobalProductService';

export const { getAllDetails, deleteData, deleteAllData, postData, patchData, changeRoleStatus, getById, getAllDetailsRabc } = createService(RBAC_BASE_URL);
