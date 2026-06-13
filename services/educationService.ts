import { getAllDetails } from '@/service/MDM_Service';
import { MDM_QUALIFICATIONS, MDM_QUALIFICATION_DEGREES, MDM_COLLEGES_BY_PCI_CODE, MDM_BOARDS, MDM_HOSPITALS } from '@/config/ApiConstant';

export async function fetchQualifications() {
  try {
    return await getAllDetails(MDM_QUALIFICATIONS);
  } catch (error) {
    throw error;
  }
}

export async function fetchQualificationDegrees(qualificationId: string) {
  try {
    return await getAllDetails(`${MDM_QUALIFICATION_DEGREES}?qualification_id=${qualificationId}`);
  } catch (error) {
    throw error;
  }
}

export async function fetchCollegeByPciCode(code: string) {
  try {
    return await getAllDetails(`${MDM_COLLEGES_BY_PCI_CODE}/${code}`);
  } catch (error) {
    throw error;
  }
}

export async function fetchBoards() {
  try {
    return await getAllDetails(MDM_BOARDS);
  } catch (error) {
    throw error;
  }
}

export async function fetchHospitals() {
  try {
    return await getAllDetails(MDM_HOSPITALS);
  } catch (error) {
    throw error;
  }
}
