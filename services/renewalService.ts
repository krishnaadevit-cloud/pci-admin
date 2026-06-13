import { postData } from "@/service/ApplicationService";
import { PHARMACY_ADD_OTHER_APPLICATION } from "@/config/ApiConstant";

export interface RenewalSubmitPayload {
  application_uuid: string;
  fresh_application_uuid: string;
  user_uuid: string;
  other_application_uuid?: string;
  renewal_details: {
    renewal_period: string | number;
    employment_status?: number;
    designation?: string;
    organization_name?: string;
    employment_file_url?: string[];
  };
}

export async function submitRenewal(payload: RenewalSubmitPayload | FormData) {
  return postData(PHARMACY_ADD_OTHER_APPLICATION, payload);
}
