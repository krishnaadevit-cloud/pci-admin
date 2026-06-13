import moment from 'moment';
import { monthShortNames } from './Settings';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';

export const cn = (val: any) => val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0);
export const cb = (val: any) => typeof val === 'string' && val.trim() === "";

export const DEFAULT_TIMEZONE = 'Asia/Kolkata';

export const formatDateTime = function (date: any) {
    return date ? moment(date).format('DD MMM YYYY') : null;
};

export const formatDateTimeY = (date: any) => {
    if (!date) return null;
    return moment(date)
        .startOf('day')
        .format('YYYY-MM-DD');
};

export const formatINR = (value: any) => {
    if (!value) return "₹ 0";
    return `₹ ${new Intl.NumberFormat("en-IN").format(Number(value))}`;
};

export const formatDateTimeDisplay = function (date: any) {
    return date ? moment(date).format('DD MMM YYYY hh:mm A') : null;
};

export const formatMonth = function (date: any) {
    return date ? moment.utc(date).format('MMM YYYY') : null;
};

export const formatMonthStructure = function (date: any) {
    return date
        ? moment.utc(date, "YYYY-MM").format("MMM YYYY")
        : null;
};

export const formatMonthByNumber = function (date: any) {
    return date ? moment.utc(date).format('MM-YYYY') : null;
};

export const formatYear = function (date: any) {
    return date ? moment.utc(date + 1).format('YYYY') : null;
};

export const formateTime = function (time: any) {
    const [hours, minutes] = time.split(':');
    return `${hours}h ${minutes}m`;
};

export const formatDateMonth = function (date: any) {
    let dateArr: any = [];
    !cn(date) && date.map((item: any) => dateArr.push(moment.utc(item).format('DD MMM ')));

    return dateArr;
};

export const getMonthYearParams = (date: Date | null) => {
    if (!date) return { month: '', year: '' };

    return {
        month: date.getMonth() + 1,
        year: date.getFullYear()
    };
};


// export const formatDate = (date: Date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
// };

export const getTimeZone = function () {
    let timezone;
    var pageUrl = window.location.href;
    if (pageUrl.indexOf('/Ceo/') > 0) {
        timezone = DEFAULT_TIMEZONE;
    } else {
        if (localStorage.getItem('timezone') && localStorage.getItem('timezone') !== null) {
            timezone = localStorage.getItem('timezone');
        }
    }
    return timezone;
};

export const createMarkup = (converdata: any) => {
    return { __html: converdata };
};

export const dateFormatTemplate = (rowData: any, rowIndex: any) => {
    return <>{rowData.created_at === rowData[rowIndex.field] ? moment.utc(rowData.created_at).format('MMM DD, YYYY') : rowData[rowIndex.field]}</>;
};

export const imageTemplate = (rowData: any, rowIndex: any) => {
    return (
        <>
            {/* {!window.cn(rowData.photo) ? ( */}
            <div className="main-img-box">
                <img src={rowData.photo} className="img-fluid" alt="main-img" />
            </div>
            {/* ) : ( */}
            <div className="main-img-box">
                <img src="/assets/images/no-image.jpeg" width="50" height="40" alt="no-data-img" />
            </div>
            {/* )} */}
        </>
    );
};



export const getAction = (pageName: string) => {
    if (typeof window === 'undefined') return null;

    const userData = sessionStorage.getItem('module_actions');

    // Check if userData is null, undefined, or empty
    if (!userData || userData === '' || userData === 'null' || userData === 'undefined') {
        return null;
    }

    try {
        const moduleActions = JSON.parse(userData);

        // Get the actions array for the requested page
        const pageActions = moduleActions[pageName];

        if (!pageActions || !Array.isArray(pageActions)) {
            return null;
        }

        // Convert array to object with boolean values
        const result: Record<string, string | boolean> = {
            menu: pageName
        };

        pageActions.forEach((action: string) => {
          
            const actionType = action.replace(`${pageName}_`, '');
            result[actionType] = true;
        });

        return result;
    } catch (error) {
        console.error('Error parsing module_actions:', error);
        return null;
    }
};

// Helper function to check specific permission
export const hasPermission = (module: string, action: string, actionPrefix?: string): boolean => {
    try {
        if (typeof window === 'undefined') return false;
        const moduleActions = sessionStorage.getItem('module_actions');
        if (!moduleActions) return false;

        const permissions = JSON.parse(moduleActions);
        const modulePermissions: string[] = permissions[module] || [];

        const prefix = actionPrefix ?? module;
        return modulePermissions.includes(`${prefix}_${action}`);
    } catch {
        return false;
    }
};

//Date Convert
export function convertDate(date: any) {
    date = new Date(date); //Date pass
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();

    return monthShortNames[month] + ' ' + (day <= 9 ? '0' + day : day) + ',' + ' ' + year;

    // return (day <= 9 ? '0' + day : day) + '-' + ( monthShortNames[month]) + '/' + year;
}

//Date Convert
export function convertDateLeave(fromDate: any, toDate: any) {
    fromDate = new Date(fromDate); //Date pass
    let day = fromDate.getDate();
    let month = fromDate.getMonth();
    let year = fromDate.getFullYear();

    toDate = new Date(toDate); //Date pass
    let toDay = toDate.getDate();
    let toMonth = toDate.getMonth();
    let toYear = toDate.getFullYear();

    return monthShortNames[month] + ' ' + (day <= 9 ? '0' + day : day) + ' - ' + monthShortNames[toMonth] + ' ' + (toDay <= 9 ? '0' + toDay : toDay) + ',' + ' ' + toYear;

    // return (day <= 9 ? '0' + day : day) + '-' + ( monthShortNames[month]) + '/' + year;
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

export const calculatePercentage = (value: any, total: any) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
};

export const capitalizeFirstLetter = (value: string | null | undefined): string => {
    if (!value) return '';

    const lowerValue = value.toLowerCase();
    return lowerValue.charAt(0).toUpperCase() + lowerValue.slice(1);
};

export const statusBodyTemplate = (rowData: any, type: string, onChange?: (id: any, e: any) => void) => {
    let label = '';
    let severity: any = '';

    switch (type) {

        // Employee list - is_active + is_doc_verify
        case 'employee':
            if (rowData.is_active === 0) { label = 'InActive'; severity = 'danger'; }
            else if (rowData.is_doc_verify) { label = 'Active'; severity = 'success'; }
            else { label = 'Pending'; severity = 'warning'; }
            break;

        // Active / Inactive string status
        case 'active':
            label = rowData.status === 'Active' ? 'Active' : 'Inactive';
            severity = rowData.status === 'Active' ? 'success' : 'warning';
            break;

        // Pending / Approved / Rejected
        case 'approval':
            const approvalMap: any = { Pending: 'warning', Approved: 'success', Rejected: 'danger' };
            label = rowData.status;
            severity = approvalMap[rowData.status] || 'info';
            break;

        // Payment - remainingAmount + paidAmount
        case 'payment':
            if (rowData.remainingAmount === 0) { label = 'Paid'; severity = 'success'; }
            else if (rowData.paidAmount > 0) { label = 'Partially Paid'; severity = 'warning'; }
            else { label = 'Unpaid'; severity = 'danger'; }
            break;

        // TDS - tdsApplied true/false string
        case 'tds':
            label = rowData.tdsApplied === 'true' ? 'Paid' : 'Unpaid';
            severity = rowData.tdsApplied === 'true' ? 'success' : 'danger';
            break;

        // Salary - paid / pending / failed
        case 'salary':
            const salaryMap: any = {
                paid: 'success',
                pending: 'warning',
                failed: 'danger'
            };
            label = rowData.status?.toUpperCase();
            severity = salaryMap[rowData.status?.toLowerCase()] || 'info';
            break;


        // Toggle switch for active/inactive status
        case 'switch':
            return (
                <div className="actions flex flex-column align-items-center">
                    <InputSwitch
                        className="mr-2 mb-2"
                        checked={rowData.status === true}
                        onChange={(e) => onChange && onChange(rowData.id, e)}
                    />
                    <Tag
                        value={rowData.status ? 'Active' : 'InActive'}
                        severity={rowData.status ? 'success' : 'danger'}
                        className="hc-tag"
                    />
                </div>
            );
    }

    return <Tag value={label} severity={severity} className="hc-tag" />;
};