export const MDM_BASE_URL = '/proxy/mdm';
export const RBAC_BASE_URL = '/proxy/rbac';
export const USER_BASE_URL = '/proxy/users';
export const LOGIN_BASE_URL = '/proxy/auth';
export const ELIGIBILITY_BASE_URL = '/proxy/eligibility';
export const SCRUTINY_BASE_URL = '/proxy/v1/scrutiny';

// PHARMACY
export const PHARMACY_FRESH_APPLICATION_BASE_URL = '/proxy/v1/application';
export const OFFICIAL_ELIGIBILITY_OTHER_STATE_BASE_URL = '/proxy/eligibility';

// PAYMENTS
export const PAYMENT_BASE_URL = '/proxy/payment';

export const APP_BASE_URL_RBAC = 'https://m6nrlf0d-3002.inc1.devtunnels.ms';

export const IMAGE_BASEURL = APP_BASE_URL_RBAC + 'front/assets/img/search_image.png';

// PAGINATION
//default pagination Row data
export const defaultRowOptions = 100;

//default PerPageRow options
export const defaultPageRowOptions = [5, 10, 15, 20, 25, 50, 100];

//paginatior entries showing
export const showingEntries = 'Showing {first} to {last} of {totalRecords} Entries';

//paginator links & dropdown
export const paginatorLinks = 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown';

//date picker options
export const datePickerOptions = [
    { label: 'Custom', value: 'custom' },
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: 'last7day' },
    { label: 'Last 30 days', value: 'last30days' },
    { label: 'Last 90 days', value: 'last90days' },
    { label: 'Last month', value: 'lastmonth' },
    { label: 'Last year', value: 'lastyear' },
    { label: 'Week to date', value: 'weektodate' },
    { label: 'Month to date', value: 'monthtodate' },
    { label: 'Year to date', value: 'yeartodate' }
];

export const rolePermission = [
    { label: 'Dashboard', value: 'Dashboard' },
    { label: 'Manage Orders', value: 'Manage Orders' },
    { label: 'Manage Category', value: 'Manage Category' },
    { label: 'Manage Merchants', value: 'Manage Merchants' },
    { label: 'Manage Products', value: 'Manage Products' },
    { label: 'Customers', value: 'Customers' },
    { label: 'Reports', value: 'Reports' }
];

//emilPattern
export const emailPattern = new RegExp(
    /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
);

//pancard Pattern
export const panPattern = new RegExp(/^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/i);

// gstpattern
export const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;


//Date Convert To YYYY/MM/DD
export function convertDateFrom(date: any) {
    date = new Date(date); //Date pass
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    return year + '-' + (month <= 9 ? '0' + month : month) + '-' + (day <= 9 ? '0' + day : day);
}

//Month List
export const monthShortNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//Skeleton

// skeleton items & length
export const Skeletonitems = Array.from({ length: 10 }, (_, i) => ({
    id: i,
}));

// SKELETON FOR COLUMN BODY — pill bar with shimmer (used inside DataTable loading state)
export function SkeletonbodyTemplate(): JSX.Element {
    return (
        <div className="hc-skeleton-cell">
            <span className="hc-skeleton-bar" aria-hidden="true" />
        </div>
    );
}

// ─── Static Options ───────────────────────────────────────────────────────────

export const APPLICATION_STATUS_OPTIONS = [
    { label: "Pending", value: "Pending" },
    { label: "Approved", value: "Approved" },
    { label: "Rejected", value: "Rejected" },
    { label: "In Review", value: "In Review" },
];

export const GENDER_OPTIONS = [
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Other", value: "OTHER" },
    // {label: "Prefer not to say", value: "PREFER_NOT_TO_SAY"},
];

export const RELIGION_OPTIONS = [
    { label: "Hinduism", value: "Hinduism" },
    { label: "Islam", value: "Islam" },
    { label: "Christianity", value: "Christianity" },
    { label: "Sikhism", value: "Sikhism" },
    { label: "Buddhism", value: "Buddhism" },
    { label: "Jainism", value: "Jainism" },
    { label: "Others", value: "Others" },
];

export const STUDENT_CATEGORY_OPTIONS = [
    { label: "General (GEN)", value: "General (GEN)" },
    { label: "OBC", value: "OBC" },
    { label: "SC", value: "SC" },
    { label: "ST", value: "ST" },
    { label: "EWS", value: "EWS" },
];

export const BLOOD_GROUP_OPTIONS = [
    { label: "A+", value: "A+" },
    { label: "A-", value: "A-" },
    { label: "B+", value: "B+" },
    { label: "B-", value: "B-" },
    { label: "O+", value: "O+" },
    { label: "O-", value: "O-" },
    { label: "AB+", value: "AB+" },
    { label: "AB-", value: "AB-" },
];

export const NRI_OPTIONS = [
    { label: "No", value: "No" },
    { label: "Yes", value: "Yes" },
];

export const DISABILITY_OPTIONS = [
    { label: "None", value: "None" },
    { label: "Visual", value: "Visual" },
    { label: "Hearing", value: "Hearing" },
    { label: "Locomotor", value: "Locomotor" },
    { label: "Others", value: "Others" },
];
