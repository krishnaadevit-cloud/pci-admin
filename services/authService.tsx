import { getAllDetails, postData, patchData } from '@/service/Login_Service';
import { LOGIN, PHARMACY_REGISTER, PHARMACY_TENANTS, VERIFY_OTP, RESEND_OTP, PHARMACY_ADD_FRESH_APPLICATION, HPR_AADHAAR_VERIFY, HPR_AADHAAR_IS_AUTHENTICATED, HPR_AADHAAR_LINK, DIGILOCKER_INITIATE, DIGILOCKER_DOCUMENTS, CHANGE_PASSWORD } from '@/config/ApiConstant';
import { postData as pharmacyPostData } from '@/service/PharmacyApplication_Service';

export async function loginUser(data: any) {
    try {
        const response = await postData(LOGIN, data);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getTenants() {
    try {
        const response = await getAllDetails(PHARMACY_TENANTS);
        return response;
    } catch (error) {
        throw error;
    } 
}

export async function registerUser(data: any) {
    try {
        const response = await postData(PHARMACY_REGISTER, data);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function verifyOtp(data: any) {
    try {
        const response = await postData(VERIFY_OTP, data);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function resendOtp(data: any) {
    try {
        const response = await postData(RESEND_OTP, data);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function saveFreshApplication(data: any) {
    try {
        const response = await pharmacyPostData(PHARMACY_ADD_FRESH_APPLICATION, data);
        return response;
    } catch (error) {
        throw error;
    }
}


export interface DigilockerDoc {
    name: string;
    uri: string;
    issuedAt?: string;
}

export async function initiateDigilocker(): Promise<{ authorizationUrl: string; state: string }> {
    try {
        const response = await getAllDetails(DIGILOCKER_INITIATE);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function getDigilockerDocuments(state: string): Promise<{ documents: DigilockerDoc[]; status: string; digilockerId?: string; name?: string }> {
    try {
        const response = await getAllDetails(`${DIGILOCKER_DOCUMENTS}?state=${encodeURIComponent(state)}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export async function hprAadhaarLink() {
    try {
        const response = await postData(HPR_AADHAAR_LINK, {});
        return response;
    } catch (error) {
        throw error;
    }
}

export async function hprAadhaarIsAuthenticated(txnId: string) {
    try {
        const response = await postData(HPR_AADHAAR_IS_AUTHENTICATED, { txnId });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function hprAadhaarVerify(txnId: string) {
    try {
        const response = await postData(HPR_AADHAAR_VERIFY, { txnId });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    try {
        const payload = {
            currentPassword: btoa(currentPassword),
            newPassword: btoa(newPassword),
            confirmPassword: btoa(confirmPassword),
        };
        const response = await patchData(CHANGE_PASSWORD, '', payload);
        return response;
    } catch (error) {
        throw error;
    }
}
