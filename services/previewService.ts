import { getAllDetails } from "@/service/ApplicationService";
import { PHARMACY_APPLICATION_PREVIEW } from "@/config/ApiConstant";

export async function fetchPreview(appUuid: string) {
  try {
    return await getAllDetails(`${PHARMACY_APPLICATION_PREVIEW}?appUuid=${appUuid}`);
  } catch (error) {
    throw error;
  }
}
