/********************  START WEB API SLUG ************* */

// Prefixed WEB URL FOR ADMIN
const ADMIN = '/api/auth/';
const MDM = '/api/mdm/';
const RBAC = '/api/rbac/';
const USER = '/api/users/';
const ELIGIBILITY = '/api/eligibility/';
const REFRESHERCOURSE = '/api/v1/refresher-course/';
const SCRUTINY_FRESH_APPLICATION = '/api/v1/scrutiny/';

// Payments
const PAYMENTS = '/api/payment/';

// Prefixed WEB URL FOR PHARMACY
const PHARMACY_FRESH_APPLICATION = '/api/v1/application/';
const OFFICIAL_ELIGIBILITY =  '/api/v1/application/';


export const OFFICE_PHARMACY_APPLICATION_LIST = 'api/v1/application/other-application/list';
export const OFFICE_GET_OTHER_APPLICATION_DETAILS = "/api/v1/application/other-application";

// Login / Auth
export const LOGIN = ADMIN + 'login';
export const VERIFY_OTP = ADMIN + 'otp/verify';
export const RESEND_OTP = ADMIN + 'otp/resend';
export const PHARMACY_REGISTER = ADMIN + 'register';
export const PHARMACY_TENANTS = ADMIN + 'tenants';

// Master/Application Document endpoints
export const MDM_APPLICATION_TYPE = MDM + 'application-types';
export const MDM_SCRUTINY_APP_TYPES = MDM + 'application-types/scrutiny-required';
export const MDM_DOCUMENT_APPLICATION = MDM + 'documents';
export const MDM_COUNCIL_APPLICATION = MDM + 'councils';
export const MDM_LOCATION_STATES = MDM + 'locations/states';
export const MDM_STATES = MDM + 'locations/states';
export const MDM_DEGREE_APPLICATION = MDM + 'degrees';
export const MDM_LOCATION_CITIES = MDM + 'locations/cities';
export const MDM_BOARD_APPLICATION = MDM + 'boards';
export const MDM_UNIVERSITY_APPLICATION = MDM + 'universities';
export const MDM_EXAM_AUTHORITY = MDM + 'exam-authorities';


// User Management endpoints
export const USER_LIST = USER + 'list-users';
export const REGISTRAR_SIGNATURE_UPLOAD = USER + 'upload-registrar-signature';
export const USER_CREATE = USER + 'create-users';        
export const USER_UPDATE = USER + 'update-user';
export const USER_DELETE = USER + 'delete-user';
export const USER_GET_BY_ID = USER + 'get-user-by-id';
export const UPDATE_USER_STATUS = USER + 'change-status';


export const MDM_HOSPITAL_APPLICATION = MDM + 'hospitals';
export const MDM_COLLEGE_APPLICATION = MDM + 'colleges';
export const MDM_APPLICATION_DOCUMENTS = MDM + 'application-documents';
export const MDM_DOCUMENT = MDM + 'documents';
export const MDM_UNIVERSITY = MDM + 'universities';
export const MDM_APPLICATION_APPROVAL = MDM + 'approvals';


// User Management
export const RBAC_GET_ROLES = RBAC + 'roles';


// ++++ Prefixed END POINTS FOR PHARMACY ++++

// Pharmacy Fresh-Application
export const PHARMACY_ADD_FRESH_APPLICATION = PHARMACY_FRESH_APPLICATION + 'fresh/save';
export const PHARMACY_ADD_OTHER_APPLICATION = PHARMACY_FRESH_APPLICATION + 'other-application/save';
export const PHARMACY_SAVE_ADDRESS_CHANGE = PHARMACY_FRESH_APPLICATION + 'other-application/save-address-change';
export const PHARMACY_DASHBOARD = PHARMACY_FRESH_APPLICATION + 'dashboard';
export const PHARMACY_SAVE_OTHER_DOCUMENT = PHARMACY_FRESH_APPLICATION + 'save-others-document';
export const PHARMACY_DELETE_OTHER_DOCUMENT = PHARMACY_FRESH_APPLICATION + 'fresh/other-documents';
export const PHARMACY_APPLICATION_PREVIEW = PHARMACY_FRESH_APPLICATION + 'preview';

export const OFFICIAL_ELIGIBILITY_LIST = OFFICIAL_ELIGIBILITY + 'eligibility/list';
export const OFFICIAL_ELIGIBILITY_DETAILS = OFFICIAL_ELIGIBILITY + 'eligibility';


export const MDM_PINCODE = MDM + 'pincode';

export const MDM_QUALIFICATIONS = MDM + 'qualifications';
export const MDM_QUALIFICATION_DEGREES = MDM + 'qualification-degrees';
export const MDM_COLLEGES_BY_PCI_CODE = MDM + 'colleges/pci-code';
export const MDM_BOARDS = MDM + 'front/board';
export const MDM_HOSPITALS = MDM + 'front/hospital';

// Pharmacy portal — application list, fee payments, certificates & smart card
export const PHARMACY_APPLICATION_LIST   = PHARMACY_FRESH_APPLICATION + 'pharmacist-application-list';
export const PHARMACY_FEE_PAYMENT_LIST   = PHARMACY_FRESH_APPLICATION + 'pharmacist-fee-payment';
export const PHARMACY_CERTIFICATE_LIST   = PHARMACY_FRESH_APPLICATION + 'pharmacist-certificate-list';
export const PHARMACY_SMART_CARD          = PHARMACY_FRESH_APPLICATION + 'pharmacist-smart-card';
export const PHARMACY_SMART_CARD_DOWNLOAD = PHARMACY_FRESH_APPLICATION + 'pharmacist-smart-card/download';

// Payments
export const CREATE_PAYMENT_ORDER = PAYMENTS + 'fee-summary';
export const CREATE_ORDER = PAYMENTS + 'create-order';
export const VERIFY_ORDER = PAYMENTS + 'verify-order';

// HPR / Aadhaar KYC
export const HPR_AADHAAR_LINK = ADMIN + 'hpr/aadhaar/link';
export const HPR_AADHAAR_IS_AUTHENTICATED = ADMIN + 'hpr/aadhaar/is-authenticated';
export const HPR_AADHAAR_VERIFY = ADMIN + 'hpr/aadhaar/verify';

// DigiLocker (Meri Pehchaan)
export const DIGILOCKER_INITIATE = ADMIN + 'digilocker/initiate';
export const DIGILOCKER_DOCUMENTS = ADMIN + 'digilocker/documents';

// Office portal Fresh Application details

export const OFFICE_GET_FRESH_APPLICATION_DETAILS = PHARMACY_FRESH_APPLICATION + '/fresh';
export const OFFICE_VERIFY_DOCUMENT_STATUS = PHARMACY_FRESH_APPLICATION + 'verify-document-status';
export const OFFICE_SUBMIT_FRESH_APPLICATION = PHARMACY_FRESH_APPLICATION + 'fresh/submit-app';
export const OFFICE_GET_ADD_QUALIFICATION_APPLICATION_DETAILS = PHARMACY_FRESH_APPLICATION + '/add-qualification';
export const OFFICE_GET_CHANGE_NAME_APPLICATION_DETAILS = PHARMACY_FRESH_APPLICATION + '/change-name';
export const OFFICE_GET_GOOD_STANDING_CERTIFICATE_APPLICATION_DETAILS = PHARMACY_FRESH_APPLICATION + '/good-standing-certificate';
export const WITHOUT_SCRUTINY_SAVE_APP = PHARMACY_FRESH_APPLICATION + 'without-scrutiny-save-app';

// Office portal Fresh Application list
export const OFFICE_GET_FRESH_APPLICATION = PHARMACY_FRESH_APPLICATION + '/fresh/list';
export const OFFICE_GET_ADD_QUALIFICATION_APPLICATION = PHARMACY_FRESH_APPLICATION + '/add-qualification/list';
export const OFFICE_GET_CHANGE_NAME_APPLICATION = PHARMACY_FRESH_APPLICATION + '/change-name/list';
export const OFFICE_GET_GOOD_STANDING_CERTIFICATE_APPLICATION = PHARMACY_FRESH_APPLICATION + '/good-standing-certificate/list';



// export const OFFICE_GET


// Onboarding / Go-live readiness — application-service (PHARMACY_FRESH_APPLICATION_BASE_URL)
// Relative paths — appended to /proxy/v1/application by createService()
export const ONBOARDING_READINESS      = PHARMACY_FRESH_APPLICATION + 'onboarding/readiness';
export const ONBOARDING_TENANT_STATUS  = PHARMACY_FRESH_APPLICATION + 'onboarding/tenant-status';

// Scrutiny step configuration — application-service
export const SCRUTINY_CONFIG_GET  = PHARMACY_FRESH_APPLICATION + 'scrutiny-step-config';
export const SCRUTINY_CONFIG_SAVE = PHARMACY_FRESH_APPLICATION + 'scrutiny-step-config/bulk-save';

//Onboarding Fee Structure By Application Wise
export const FEE_STRUCTURE_API = PHARMACY_FRESH_APPLICATION + 'fee-structures';

// Scrutiny applications — scrutiny-service (/proxy/v1/scrutiny)
export const SCRUTINY_APPLICATIONS = SCRUTINY_FRESH_APPLICATION + 'applications';
export const SCRUTINY_FRESH_APPLICATION_DETAIL = SCRUTINY_FRESH_APPLICATION + 'application-detail';
export const SCRUTINY_SUBMIT_REVIEW = SCRUTINY_FRESH_APPLICATION + 'applications/submit-review';

// Registrar signature — application-service
export const REGISTRAR_SIGNATURE  = PHARMACY_FRESH_APPLICATION + 'tenant/registrar-signature';

// Tenant details — application-service
export const GET_TENANT_DETAILS     = PHARMACY_FRESH_APPLICATION + 'tenant/get-tenant-details';
export const UPDATE_TENANT_DETAILS  = PHARMACY_FRESH_APPLICATION + 'tenant/update-tenant-details';

// Change password — auth-service (LOGIN_BASE_URL = /proxy/auth)
export const CHANGE_PASSWORD = ADMIN + 'change-password';
// Onboarding / Go-live readiness (Next.js internal API routes — no proxy needed)
export const ONBOARDING_GO_LIVE = '/api/onboarding/go-live';


// eligibility OTHER STATE options
 export const OFFICIAL_ELIGIBILITY_OTHER_STATE = PHARMACY_FRESH_APPLICATION + '/eligibility/list';

// Pharmacist global search
export const GET_PHARMACISTS_DATA = PHARMACY_FRESH_APPLICATION + 'get-pharmacists-data';

// Refresher Course
export const SAVE_REFRESHER_COURSE             = REFRESHERCOURSE + 'save';
export const GET_REFRESHER_COURSE_LIST         = REFRESHERCOURSE + 'list';
export const GET_REFRESHER_COURSE_BY_ID        = REFRESHERCOURSE; // GET /api/v1/refresher-course/{id}
export const CHANGE_REFRESHER_COURSE_STATUS    = REFRESHERCOURSE + 'change-status'; // POST /api/v1/refresher-course/change-status/{uuid}
export const DELETE_REFRESHER_COURSE           = REFRESHERCOURSE + 'delete'; // DELETE /api/v1/refresher-course/delete/{uuid}
