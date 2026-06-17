//interface for columns
interface ColumnMeta {
  field: string;
  header: string;
}

//Role Columns
export const RoleColumns: ColumnMeta[] = [
  { field: "name", header: "Name" },
  { field: "action", header: "Action" },
];

// Fresh Application Columns
export const FreshApplicationColumns: ColumnMeta[] = [
  { field: "id", header: "APP ID" },
  { field: "applicantName", header: "APPLICANT NAME" },
  { field: "email", header: "EMAIL" },
  { field: "category", header: "CATEGORY" },
  { field: "dateSubmitted", header: "DATE APPLIED" },
  { field: "status", header: "STATUS" },
  { field: "action", header: "ACTIONS" },
];

// User Management Columns
export const UserManagementColumns = [
  // { field: "employeeCode", header: "Employee Code" },
  { field: "name", header: "Name" },
  { field: "email", header: "Email" },
  { field: "mobile", header: "Mobile Number" },
  { field: "role", header: "Role" },
  { field: "state", header: "State" },
  { field: "city", header: "City" },
  { field: "status", header: "Status" },
  { field: "action", header: "Actions" },
];

export const DocumentMasterListColumns: ColumnMeta[] = [
  { field: "rowReorder", header: "" },
  { field: "documentName", header: "Document Name" },
  { field: "status", header: "Status" },
  { field: "action", header: "Action" },
];

// role management columns
export const RoleManagementListColumns: ColumnMeta[] = [
  { field: "name", header: "Role" },
  { field: "status", header: "Status" },
  { field: "action", header: "Action" },
];

// Application Type Columns
export const ApplicationTypeColumns: ColumnMeta[] = [
  { field: "applicationName", header: "Application Name" },
  { field: "action", header: "Action" },
];
export const HospitalApplicationColumns: ColumnMeta[] = [
  { field: "hospitalName", header: "Hospital Name" },
  { field: "stateName", header: "State Name" },
  { field: "address", header: "Address" },
  { field: "pincode", header: "Pincode" },
  { field: "action", header: "Action" },
];
export const CollegeApplicationColumns: ColumnMeta[] = [
  { field: "pciCode", header: "PCI Code" },
  { field: "universityName", header: "University Name" },
  { field: "collegeName", header: "College Name" },
  // { field: 'universityId', header: 'University ID' },
  { field: "cityName", header: "City Name" },
  { field: "pincode", header: "Pincode" },
  { field: "action", header: "Action" },
];
export const ApprovalApplicationColumns: ColumnMeta[] = [
  { field: "pciReferenceNumber", header: "PCI Reference Number" },
  { field: "pciResolutionNumber", header: "PCI Resolution Number" },
  { field: "pciCircularDate", header: "PCI Circular Date" },
  { field: "universityName", header: "University Name" },
  { field: "collegeName", header: "College Name" },
  { field: "degreeName", header: "Degree Name" },
  { field: "hospitalName", header: "Hospital Name" },
  { field: "stateName", header: "State Name" },
  { field: "seats", header: "Seats" },
  { field: "action", header: "Action" },
];

// Degree Application Columns
export const DegreeApplicationColumns: ColumnMeta[] = [
  { field: "degreeName", header: "Degree Name" },
  { field: "action", header: "Action" },
];

// Documents Application  Columns
export const DocumentsApplicationColumns: ColumnMeta[] = [
  { field: "documentName", header: "Document Name" },
  { field: "action", header: "Action" },
];

// Council Application  Columns
export const CouncilApplicationColumns: ColumnMeta[] = [
  { field: "councilName", header: "Council Name" },
  { field: "address", header: "Address" },
  { field: "pincode", header: "Pincode" },
  { field: "action", header: "Action" },
];
// Board Application Columns
export const BoardApplicationColumns: ColumnMeta[] = [
  { field: "boardName", header: "Board Name" },
  { field: "stateName", header: "State Name" },
  { field: "action", header: "Action" },
];

// University Application Columns
export const UniversityApplicationColumns: ColumnMeta[] = [
  { field: "universityName", header: "University Name" },
  { field: "stateName", header: "State Name" },
  { field: "address", header: "Address" },
  { field: "pincode", header: "Pincode" },
  { field: "action", header: "Action" },
];

// Exam Authority Application Columns
export const ExamAuthorityApplicationColumns: ColumnMeta[] = [
  { field: "examAuthorityName", header: "Exam Authority Name" },
  { field: "stateName", header: "State Name" },
  { field: "cityName", header: "City Name" },
  { field: "address", header: "Address" },
  { field: "pincode", header: "Pincode" },
  { field: "action", header: "Action" },
];

//  Application Type Columns
export const ApplicationColumns = [
  { field: "applicationNo", header: "Application No" },
  { field: "receiptNo", header: "Fee Receipt No" },
  { field: "date", header: "Date" },
  { field: "applicationType", header: "Application Type" },
  { field: "remark", header: "Remark" },
  { field: "status", header: "Status" }, 
  { field: "action", header: "Action" },  
];


// Scrutiny Fresh Applications Columns
export const SCRUTINY_FRESH_APPLICATIONS_DATATABLE_SETTING = [
  { field: "srNo",          header: "Sr No."                  },
  { field: "name",          header: "Name"                    },
  { field: "fileNo",        header: "File No."                },
  { field: "dob",           header: "DOB"                     },
  { field: "qualification", header: "Registrable Qualification"},
  { field: "instituteCode", header: "Institute Code"          },
  { field: "collegeName",    header: "College Name"  },
  { field: "verifiedByName", header: "Revied By"  },
  { field: "action",         header: "Action"        },
];

// Fresh Application Options
export const FRESH_REGISTRATION_DATATABLE_SETTING = [
  { field: "name", header: "Name" },
  { field: "fileNumber", header: "File Number" },
  { field: "paymentRefNo", header: "Payment Ref. No." },
  { field: "paymentDate", header: "Payment Date" },
  { field: "qualification", header: "Registrable Qualification" },
  { field: "instituteCode", header: "Institute Code" },
  { field: "collegeName", header: "College Name" },
  { field: "status", header: "Status" },
  { field: "action", header: "Action" },
];

// Fresh Application Other States Options
export const FRESH_REGISTRATION_OTHER_STATES_DATATABLE_SETTING = [
  { field: "name", header: "Name" },
  { field: "fileNo", header: "File Number" },
  { field: "paymentRefNo", header: "Payment Ref. No." },
  { field: "paymentDate", header: "Payment Date" },
  { field: "qualification", header: "Registrable Qualification" },
  { field: "instituteCode", header: "Institute Code" },
  { field: "collegeName", header: "College Name" },
  { field: "status", header: "Status" },
  { field: "action", header: "Action" },
];



// Duplicate Certificate Options
export const DUPLICATE_APPLICATION_OPTIONS = [
    { field: 'fullName',         header: 'Full Name'         },
    { field: 'permanentAddress', header: 'Permanent Address' },
    { field: 'mobileNo',         header: 'Mobile No.'        },
    { field: 'secondMobileNo',   header: 'Second Mobile No.' },
    { field: 'email',            header: 'Email'             },
    { field: 'status',           header: 'Status'            },
    { field: 'action',           header: 'Action'            },
];

// eligibility other country options
export const ELIGIBILITY_OTHER_COUNTRY_OPTIONS = [
    { field: 'srNo',             header: 'Sr No.'           },
    { field: 'name',             header: 'Full Name'        },
    { field: 'mobileNo',         header: 'Mobile No.'       },
    { field: 'email',            header: 'Email'            },
    { field: 'gender',  header: 'Gender'                    },
    { field: 'birthDate',  header: 'Birth Date'             },
    { field: 'nationality',  header: 'Nationality'          },
    { field: 'status',           header: 'Status'           },
    { field: 'aadhaarVerified',  header: 'Aadhaar Verified' },
    { field: 'action',           header: 'Action'           },
];

// eligibility other state options
export const ELIGIBILITY_OTHER_STATE_OPTIONS = [
    { field: 'srNo',             header: 'Sr No.'           },
    { field: 'name',             header: 'Full Name'        },
    { field: 'mobileNo',         header: 'Mobile No.'       },
    { field: 'email',            header: 'Email'            },
    { field: 'gender',  header: 'Gender'                    },
    { field: 'birthDate',  header: 'Birth Date'             },
    { field: 'nationality',  header: 'Nationality'          },
    { field: 'status',           header: 'Status'           },
    { field: 'aadhaarVerified',  header: 'Aadhaar Verified' },
    { field: 'action',           header: 'Action'           },
];


export const CHANGE_NAME_APPLICATION_OPTIONS = [
  { field: "currentName", header: "Current Name" },
  { field: "newName", header: "New Name" },
  { field: "email", header: "Email" },
  { field: "mobileNo", header: "Mobile No" },
  { field: "status", header: "Status" },
  { field: "action", header: "Action" },
];

export const GET_GOOD_STANDING_CERTIFICAT_APPLICATION_OPTIONS = [
  { field: "applicationNo", header: "Application No" },
  { field: "name", header: "Name" },
  { field: "email", header: "Email" },
  { field: "Certificate", header: "Certificate" },
  { field: "status", header: "Status" },
  { field: "action", header: "Action" },
];

export const GET_ADD_QUALIFICATION_APPLICATION_OPTIONS = [
  { field: "applicationNo", header: "Application No" },
  { field: "name", header: "Name" },
  { field: "email", header: "Email" },
  { field: "New Degree", header: "New Degree" },
  { field: "status", header: "Status" },
  { field: "action", header: "Action" },
];

 
export const CHANGE_ADDRESS_OPTIONS = [
    { field: 'srNo',      header: 'Sr. No.'      },
    { field: 'name',      header: 'Applicant'    },
    { field: 'newCity',   header: 'New Address'  },
    { field: 'oldCity',   header: 'Old Address'  },
    { field: 'createdAt', header: 'Created Date' },
    { field: 'status',    header: 'Status'       },
    { field: 'action',    header: 'Action'       },
];
 
export const RE_ENTRY_REGISTRATION_OPTIONS = [
  { field: "srNo", header: "Sr. No." },
  { field: "name", header: "Name" },
  { field: "email", header: "Email" },
  { field: "mobileNo", header: "Mobile No." },
  // { field: 'applicationType',  header: 'Application Type'  },
  { field: "gender", header: "Gender" },
  { field: "status", header: "Status" },
  // { field: 'digilockerStatus', header: 'Digilocker Status' },
  { field: "action", header: "Action" },
];
 
export const RENEWAL_REGISTRATION_OPTIONS = [
    { field: "srNo",               header: "Sr. No."              },
    { field: "name",               header: "Name"                 },
    { field: "fileNo",             header: "File No"              },
    { field: "registrationNo",     header: "Registration No"      },
    { field: "validity",           header: "Validity"             },
    { field: "paymentReferenceNo", header: "Payment Reference No" },
    { field: "paymentDate",        header: "Payment Date"         },
    { field: "status",             header: "Status"               },
    { field: "action",             header: "Action"               },
];

// Refresher Course List Columns
export const REFRESHER_COURSE_DATATABLE_SETTING = [
{ field: "srNo", header: "Sr No."},
{ field: "courseName", header: "Refresher Course Name"},
{ field: "startDate", header: "Start Date"},
{ field: "endDate", header: "End Date"},
{ field: "totalSlots", header: "Total Slots"},
{ field: "bookedSlots", header: "Booked Slots"},
{ field: "availableSlots", header: "Available Slots"},
{ field: "bookingStatus", header: "Booking Status"},
{ field: "publishedStatus", header: "Published Status"},
{ field: "examStatus", header: "Exam Status"},
{ field: "action",header: "Action"},
];