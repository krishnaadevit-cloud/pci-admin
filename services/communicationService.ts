import { PHARMACY_FRESH_APPLICATION_BASE_URL } from '@/appConfig/Settings';
import { PHARMACY_ADD_FRESH_APPLICATION } from '@/config/ApiConstant';
import { createService } from '@/service/GlobalProductService';
import type { CommunicationState } from '@/app/(full-page)/pharmacy/fresh-registration/registrationState';

const { postData } = createService(PHARMACY_FRESH_APPLICATION_BASE_URL);

export async function saveCommunicationDetails(userUuid: string, communication: CommunicationState) {
  const body = {
    user_uuid: userUuid,
    communication_details: {
      permanent_address: communication.permanent.address,
      permanent_state: communication.permanent.state,
      permanent_district: communication.permanent.district,
      permanent_city: communication.permanent.city,
      permanent_pin_code: communication.permanent.pinCode,
      postal_address: communication.correspondence.address,
      postal_state: communication.correspondence.state,
      postal_district: communication.correspondence.district,
      postal_city: communication.correspondence.city,
      postal_pin_code: communication.correspondence.pinCode,
      professional_address: communication.professional.address,
      professional_state: communication.professional.state,
      professional_district: communication.professional.district,
      professional_city: communication.professional.city,
      professional_pin_code: communication.professional.pinCode,
    },
  };
  return postData(PHARMACY_ADD_FRESH_APPLICATION, body);
}
