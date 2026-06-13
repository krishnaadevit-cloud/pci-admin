import { emailPattern, gstRegex, panPattern } from '../appConfig/Settings';
import { cn, cb } from '../appConfig/AppHelper';


export const LoginValidate = (inputDetail: any) => {
    let isError: boolean = false;

    let errorObj: any = {};

    let errors: any = {};

    if (cn(inputDetail.email) && !cb(inputDetail.email)) {
        errors = { ...errors, email: 'Enter Email *' };
        isError = true;
    } else if (!emailPattern.test(inputDetail.email)) {
        errors = { ...errors, email: 'Enter Valid Email *' };
        isError = true;
    } else {
        errors = { ...errors, email: '' };
    }

    if (cn(inputDetail.password) && !cb(inputDetail.password)) {
        errors = { ...errors, password: 'Enter Password *' };
        isError = true;
    } else {
        errors = { ...errors, password: '' };
    }

    errorObj = { errors, isError };

    return errorObj;
};

export const ChangePasswordFormValidate = (inputDetail: any) => {
    //Define Errors Object / Validate
    let isError: boolean = false;
    let errorObj: any = {};
    let errors: any = {};

    //Check Every Input Condition
    if (cn(inputDetail.old_password) && !cb(inputDetail.old_password)) {
        errors = { ...errors, old_password: 'Enter Old Password *' };
        isError = true;
    } else {
        errors = { ...errors, password: '' };
    }
    if (cn(inputDetail.password) && !cb(inputDetail.password)) {
        errors = { ...errors, password: 'Enter New Password *' };
        isError = true;
    } else {
        errors = { ...errors, password: '' };
    }

    if (cn(inputDetail.confirm_password) && !cb(inputDetail.confirm_password)) {
        errors = { ...errors, confirm_password: 'Enter Confirm Password *' };
        isError = true;
    } else if (inputDetail.password !== inputDetail.confirm_password) {
        errors = { ...errors, confirm_password: 'Confirm Password does not Match to Password *' };
        isError = true;
    } else {
        errors = { ...errors, confirm_password: '' };
    }

    //End Every Input Condition

    errorObj = { errors, isError };

    return errorObj;
};

export const validateStudentForm = (form: any) => {
    let errors: any = {};
    let isError = false;

    // ─── BASIC DETAILS ───
    if (!form.fullName?.trim()) {
        errors.fullName = "Full name is required *";
        isError = true;
    } else {
        errors.fullName = "";
    }

    if (!form.bloodGroup) {
        errors.bloodGroup = "Select blood group *";
        isError = true;
    } else {
        errors.bloodGroup = "";
    }

    if (!form.nationality?.trim()) {
        errors.nationality = "Nationality is required *";
        isError = true;
    } else {
        errors.nationality = "";
    }

    if (!form.nri) {
        errors.nri = "Please select NRI *";
        isError = true;
    } else {
        errors.nri = "";
    }

    // ─── PAN VALIDATION ───
    if (!form.panNumber?.trim()) {
        errors.panNumber = "PAN number is required *";
        isError = true;
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) {
        errors.panNumber = "Invalid PAN format (ABCDE1234F) *";
        isError = true;
    } else {
        errors.panNumber = "";
    }

    // ─── PASSPORT ───
    if (form.studentPassportNo && form.studentPassportNo.length < 6) {
        errors.studentPassportNo = "Invalid passport number *";
        isError = true;
    } else {
        errors.studentPassportNo = "";
    }

    // ─── DATE VALIDATION ───
    if (form.passportExpiryDate) {
        const today = new Date();
        const selected = new Date(form.passportExpiryDate);

        if (selected < today) {
            errors.passportExpiryDate = "Expiry date cannot be past *";
            isError = true;
        } else {
            errors.passportExpiryDate = "";
        }
    }

    // ─── PERMANENT ADDRESS ───
    if (!form.permPincode || form.permPincode.length !== 6) {
        errors.permPincode = "Enter valid 6-digit pincode *";
        isError = true;
    } else {
        errors.permPincode = "";
    }

    if (!form.permState?.trim()) {
        errors.permState = "State is required *";
        isError = true;
    } else {
        errors.permState = "";
    }

    if (!form.permAddress?.trim()) {
        errors.permAddress = "Address is required *";
        isError = true;
    } else {
        errors.permAddress = "";
    }

    // ─── CORRESPONDENCE ADDRESS ───
    if (!form.sameAddress) {
        if (!form.corrPincode || form.corrPincode.length !== 6) {
            errors.corrPincode = "Enter valid pincode *";
            isError = true;
        } else {
            errors.corrPincode = "";
        }

        if (!form.corrState?.trim()) {
            errors.corrState = "State is required *";
            isError = true;
        } else {
            errors.corrState = "";
        }

        if (!form.corrAddress?.trim()) {
            errors.corrAddress = "Address is required *";
            isError = true;
        } else {
            errors.corrAddress = "";
        }

        if (!form.corrDistrict?.trim()) {
            errors.corrDistrict = "District is required *";
            isError = true;
        } else {
            errors.corrDistrict = "";
        }
    }

    // ─── COMMENT (OPTIONAL LIMIT) ───
    if (form.comment && form.comment.length > 300) {
        errors.comment = "Comment max 300 characters *";
        isError = true;
    } else {
        errors.comment = "";
    }

    return { errors, isError };
};

// NAME VALIDATION
export const validateName = (name: string) => {
    let error = '';

    // empty validation
    if (!name?.trim()) {
        error = 'Name is required *';
    }

    // only alphabets + spaces
    else if (!/^[A-Za-z ]+$/.test(name)) {
        error = 'Only alphabets are allowed *';
    }

    // minimum length
    else if (name.trim().length < 3) {
        error = 'Minimum 3 characters required *';
    }

    // maximum length
    else if (name.trim().length > 50) {
        error = 'Maximum 50 characters allowed *';
    }

    return error;
};

// Validation.ts

export const validateDocumentMasterForm = (form: any) => {
    const errors: any = {};

    // Application validation
    if (!form.appName) {
        errors.appName = 'Please select application *';
    }

    // Document validation
    if (!form.docName) {
        errors.docName = 'Please select document *';
    }

    return {
        errors,
        isError: Object.keys(errors).length > 0,
    };
};
// COUNCIL APPLICATION VALIDATION
export const validateCouncilApplication = (form: any) => {
    const errors: any = {};

    // Council Name
    if (!form.councilName?.trim()) {
        errors.councilName = "Council Name is required *";
    } else if (form.councilName.trim().length < 3) {
        errors.councilName = "Minimum 3 characters required";
    } else if (!/^[A-Za-z0-9 .,&()-]+$/.test(form.councilName)) {
        errors.councilName = "Invalid Council Name";
    }

    // State
    if (!form.stateId) {
        errors.stateId = "State is required *";
    }

    // Address
    if (!form.address?.trim()) {
        errors.address = "Address is required *";
    } else if (form.address.trim().length < 5) {
        errors.address = "Minimum 5 characters required";
    }

    // Pincode
    if (!form.pincode?.toString().trim()) {
        errors.pincode = "Pincode is required *";
    } else if (!/^\d{6}$/.test(form.pincode.toString())) {
        errors.pincode = "Pincode must be 6 digits";
    }

    return {
        errors,
        isError: Object.keys(errors).length > 0,
    };
};

// HOSPITAL APPLICATION VALIDATION

export const validateHospitalApplication = (form: any) => {

    let errors: any = {};
    let isError: boolean = false;

    // Hospital Name
    if (!form.hospitalName?.trim()) {

        errors.hospitalName = 'Hospital Name is required *';
        isError = true;

    } else if (form.hospitalName.trim().length < 3) {

        errors.hospitalName = 'Minimum 3 characters required *';
        isError = true;

    } else if (!/^[A-Za-z0-9 .,&()-]+$/.test(form.hospitalName)) {

        errors.hospitalName = 'Invalid Hospital Name *';
        isError = true;

    } else {

        errors.hospitalName = '';
    }

    // State
    if (!form.stateId) {

        errors.stateId = 'State is required *';
        isError = true;

    } else {

        errors.stateId = '';
    }

    // Address
    if (!form.address?.trim()) {

        errors.address = 'Address is required *';
        isError = true;

    } else if (form.address.trim().length < 5) {

        errors.address = 'Minimum 5 characters required *';
        isError = true;

    } else {

        errors.address = '';
    }

    // Pincode
    if (!form.pincode?.trim()) {

        errors.pincode = 'Pincode is required *';
        isError = true;

    } else if (!/^\d{6}$/.test(form.pincode)) {

        errors.pincode = 'Pincode must be 6 digits *';
        isError = true;

    } else {

        errors.pincode = '';
    }
    return { errors, isError };
}
// ─── UNIVERSITY APPLICATION VALIDATION ───
export const validateUniversityApplication = (data: any) => {
    const errors: any = {};
    let isError = false;

    if (!data.universityName?.trim()) {
        errors.universityName = "University Name is required *";
        isError = true;
    } else {
        errors.universityName = "";
    }

    if (!data.stateId) {
        errors.stateId = "State is required *";
        isError = true;
    } else {
        errors.stateId = "";
    }

    if (!data.address?.trim()) {
        errors.address = "Address is required *";
        isError = true;
    } else {
        errors.address = "";
    }

    if (!data.pincode?.trim()) {
        errors.pincode = "Pincode is required *";
        isError = true;
    } else if (!/^\d{6}$/.test(data.pincode)) {
        errors.pincode = "Pincode must be 6 digits *";
        isError = true;
    } else {
        errors.pincode = "";
    }

    return { errors, isError };
};

// COLLEGE APPLICATION VALIDATION

export const validateCollegeApplication = (form: any) => {

    let errors: any = {};
    let isError: boolean = false;

    // College Name
    if (!form.collegeName?.trim()) {

        errors.collegeName = 'College Name is required *';
        isError = true;

    } else if (form.collegeName.trim().length < 3) {

        errors.collegeName = 'Minimum 3 characters required *';
        isError = true;

    } else {

        errors.collegeName = '';
    }

    // PCI Code
    if (!form.pciCode?.trim()) {

        errors.pciCode = 'PCI Code is required *';
        isError = true;

    } else if (!/^[A-Za-z0-9-]+$/.test(form.pciCode)) {

        errors.pciCode = 'Invalid PCI Code *';
        isError = true;

    } else {

        errors.pciCode = '';
    }

    // University
    if (!form.universityId) {

        errors.universityId = 'University is required *';
        isError = true;

    } else {

        errors.universityId = '';
    }

    // State
    if (!form.stateId) {

        errors.stateId = 'State is required *';
        isError = true;

    } else {

        errors.stateId = '';
    }

    // City
    if (!form.cityId) {

        errors.cityId = 'City is required *';
        isError = true;

    } else {

        errors.cityId = '';
    }

    // Address
    if (!form.address?.trim()) {

        errors.address = 'Address is required *';
        isError = true;

    } else if (form.address.trim().length < 5) {

        errors.address = 'Minimum 5 characters required *';
        isError = true;

    } else {

        errors.address = '';
    }

    // Pincode
    if (!form.pincode?.trim()) {

        errors.pincode = 'Pincode is required *';
        isError = true;

    } else if (!/^\d{6}$/.test(form.pincode)) {

        errors.pincode = 'Pincode must be 6 digits *';
        isError = true;

    } else {

        errors.pincode = '';
    }

    return { errors, isError };
};

// APPROVAL APPLICATION VALIDATION

export const validateApprovalApplication = (form: any) => {

    let errors: any = {};
    let isError: boolean = false;

    // College
    if (!form.collegeId) {

        errors.collegeId = 'College is required *';
        isError = true;

    } else {

        errors.collegeId = '';
    }

    // University
    if (!form.universityId) {

        errors.universityId = 'University is required *';
        isError = true;

    } else {

        errors.universityId = '';
    }

    // Degree
    // if (!form.degreeId) {

    //     errors.degreeId = 'Degree is required *';
    //     isError = true;

    // } else {

    //     errors.degreeId = '';
    // }

    // Hospital
    if (!form.hospitalId) {

        errors.hospitalId = 'Hospital is required *';
        isError = true;

    } else {

        errors.hospitalId = '';
    }

    // State
    if (!form.stateId) {

        errors.stateId = 'State is required *';
        isError = true;

    } else {

        errors.stateId = '';
    }

    // Seats
    if (!form.seats) {

        errors.seats = 'Seats are required *';
        isError = true;

    } else if (!/^\d+$/.test(form.seats)) {

        errors.seats = 'Seats must be numeric *';
        isError = true;

    } else if (Number(form.seats) <= 0) {

        errors.seats = 'Seats must be greater than 0 *';
        isError = true;

    } else {

        errors.seats = '';
    }

    // PCI Resolution Number
    if (!form.pciResolutionNumber?.trim()) {

        errors.pciResolutionNumber = 'PCI Resolution Number is required *';
        isError = true;

    } else {

        errors.pciResolutionNumber = '';
    }

    // PCI Reference Number
    if (!form.pciReferenceNumber?.trim()) {

        errors.pciReferenceNumber = 'PCI Reference Number is required *';
        isError = true;

    } else {

        errors.pciReferenceNumber = '';
    }

    // PCI Circular Date
    if (!form.pciCircularDate) {

        errors.pciCircularDate = 'PCI Circular Date is required *';
        isError = true;

    } else {

        errors.pciCircularDate = '';
    }

    // Validity Start
    if (!form.validityStart) {

        errors.validityStart = 'Validity Start Date is required *';
        isError = true;

    } else {

        errors.validityStart = '';
    }

    // Validity End
    if (!form.validityEnd) {

        errors.validityEnd = 'Validity End Date is required *';
        isError = true;

    } else if (
        form.validityStart &&
        new Date(form.validityEnd) < new Date(form.validityStart)
    ) {

        errors.validityEnd =
            'Validity End Date cannot be before Start Date *';

        isError = true;

    } else {

        errors.validityEnd = '';
    }
    return { errors, isError };
}

// ─── EXAM AUTHORITY APPLICATION VALIDATION ───
export const validateExamAuthorityApplication = (data: any) => {
    const errors: any = {};
    let isError = false;

    if (!data.examAuthorityName?.trim()) {
        errors.examAuthorityName = "Exam Authority Name is required *";
        isError = true;
    } else {
        errors.examAuthorityName = "";
    }

    if (!data.stateId) {
        errors.stateId = "State is required *";
        isError = true;
    } else {
        errors.stateId = "";
    }

    if (!data.cityId) {
        errors.cityId = "City is required *";
        isError = true;
    } else {
        errors.cityId = "";
    }

    if (!data.address?.trim()) {
        errors.address = "Address is required *";
        isError = true;
    } else {
        errors.address = "";
    }

    if (!data.pincode?.trim()) {
        errors.pincode = "Pincode is required *";
        isError = true;
    } else if (!/^\d{6}$/.test(data.pincode)) {
        errors.pincode = "Pincode must be 6 digits *";
        isError = true;
    } else {
        errors.pincode = "";
    }

    return { errors, isError };
};


// DOCUMENT APPLICATION VALIDATION
export const validateDocumentApplication = (form: any) => {
    let errors: any = {};
    let isError = false;

    if (!form.documentName?.trim()) {
        errors.documentName = 'Document Name is required *';
        isError = true;
    } else {
        errors.documentName = '';
    }

    return { errors, isError };
};
// ─── USER DIALOG FORM VALIDATION ───
export const validateUserForm = (form: any) => {
    const errors: Partial<Record<string, string>> = {};
    let isError = false;

    if (!form.fullName?.trim()) {
        errors.fullName = "Full Name is required *";
        isError = true;
    } else if (!/^[a-zA-Z\s\-'.]+$/.test(form.fullName)) {
        errors.fullName = "Full Name can only contain letters, spaces, hyphens, apostrophes, and periods *";
        isError = true;
    } else {
        errors.fullName = "";
    }

    if (!form.roleId) {
        errors.roleId = "Role is required *";
        isError = true;
    } else {
        errors.roleId = "";
    }

    if (!form.dateOfBirth) {
        errors.dateOfBirth = "Date Of Birth is required *";
        isError = true;
    } else {
        errors.dateOfBirth = "";
    }

    if (!form.gender) {
        errors.gender = "Gender is required *";
        isError = true;
    } else {
        errors.gender = "";
    }

    if (!form.email?.trim()) {
        errors.email = "Email is required *";
        isError = true;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
        errors.email = "Enter valid email *";
        isError = true;
    } else {
        errors.email = "";
    }

    if (!form.mobile?.trim()) {
        errors.mobile = "Mobile Number is required *";
        isError = true;
    } else if (!/^\d{10}$/.test(form.mobile)) {
        errors.mobile = "Mobile Number must be 10 digits *";
        isError = true;
    } else {
        errors.mobile = "";
    }

    if (!form.stateId) {
        errors.stateId = "State is required *";
        isError = true;
    } else {
        errors.stateId = "";
    }

    if (!form.cityId) {
        errors.cityId = "City is required *";
        isError = true;
    } else {
        errors.cityId = "";
    }

    if (!form.address?.trim()) {
        errors.address = "Address is required *";
        isError = true;
    } else {
        errors.address = "";
    }

    if (!form.pincode?.trim()) {
        errors.pincode = "Pincode is required *";
        isError = true;
    } else if (!/^\d{6}$/.test(form.pincode)) {
        errors.pincode = "Pincode must be 6 digits *";
        isError = true;
    } else {
        errors.pincode = "";
    }

    return { errors, isError };
};

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS FOR INPUT VALIDATION AND DATA DISPLAY
// ────────────────────────────────────────────────────────────────────────────

/**
 * Remove special characters from text input
 * Allows only: letters, numbers, spaces, hyphens, apostrophes, periods, commas
 * @param value - Input value to filter
 * @returns Filtered value without special characters
 */
export const filterSpecialCharacters = (value: string): string => {
    if (!value) return '';
    return value.replace(/[^a-zA-Z0-9\s\-'.(),&]/g, '');
};

/**
 * Display empty data as dash
 * Used in table columns to show "-" when data is not available
 * @param value - Data value
 * @returns Value or "-" if empty
 */
export const displayEmptyData = (value: any): string => {
    if (!value || value === '' || value === null || value === undefined) {
        return '-';
    }
    return value.toString().trim() === '' ? '-' : value.toString().trim();
};

/**
 * Safe number input - allows only digits
 * @param value - Input value
 * @returns Filtered value with only digits
 */
export const filterNumbersOnly = (value: string): string => {
    if (!value) return '';
    return value.replace(/[^0-9]/g, '');
};

/**
 * Safe alphanumeric input - allows letters and numbers only
 * @param value - Input value
 * @returns Filtered value with alphanumeric characters
 */
export const filterAlphanumericOnly = (value: string): string => {
    if (!value) return '';
    return value.replace(/[^a-zA-Z0-9\s]/g, '');
};