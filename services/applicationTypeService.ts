import { getAllDetails } from "@/service/MDM_Service";
import { MDM_APPLICATION_TYPE } from "@/config/ApiConstant";

export async function fetchApplicationTypes() {
  try {
    return await getAllDetails(MDM_APPLICATION_TYPE);
  } catch (error) {
    throw error;
  }
}
