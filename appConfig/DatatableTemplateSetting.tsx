import Link from 'next/link';
import { Avatar } from 'primereact/avatar';
import { capitalizeFirstLetter, hasPermission, cn } from './AppHelper';


export const nameTemplate = (rowData: any, canView: boolean) => {
    return (
        <>
            <div className="hc-employee-cell">
                <div className="hc-avatar-wrapper">
                    {!cn(rowData?.employee_profile_img) ? (
                        <Avatar
                            image={rowData?.employee_profile_img}
                            shape="circle"
                            size="large"
                            className="hc-avatar"
                        />
                    ) : (
                        <Avatar
                            icon="pi pi-user"
                            shape="circle"
                            size="large"
                            className="hc-avatar hc-avatar-placeholder"
                            style={{
                                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                color: '#ffffff'
                            }}
                        />
                    )}
                </div>

                <div className="hc-employee-info">
                    <div className="hc-employee-name">
                        {capitalizeFirstLetter(rowData?.first_name)}{' '}
                        {capitalizeFirstLetter(rowData?.last_name)}
                    </div>

                    {/* Email */}
                    {rowData?.email && (
                        <div className="hc-employee-contact">
                            <i className="pi pi-envelope"></i>
                            <span>{rowData?.email}</span>
                            <i className="pi pi-phone"></i>
                            <span>{rowData?.mobile}</span>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
};

export const nameLeaveListTemplate = (rowData: any) => {
    return (
        <Link href={`/employees/employee-profile/` + btoa(rowData?.employee?.id)}>
            <div className="hc-employee-cell">
                <div className="hc-avatar-wrapper">
                    {!cn(rowData?.employee?.employee_profile_img) ? (
                        <Avatar
                            image={rowData?.employee?.employee_profile_img}
                            shape="circle"
                            size="large"
                            className="hc-avatar"
                        />
                    ) : (
                        <Avatar
                            icon="pi pi-user"
                            shape="circle"
                            size="large"
                            className="hc-avatar hc-avatar-placeholder"
                            style={{
                                background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                                color: '#ffffff'
                            }}
                        />
                    )}
                </div>

                <div className="hc-employee-info">
                    <div className="hc-employee-name">
                        {rowData?.employee?.first_name} {rowData?.employee?.last_name}
                    </div>

                    {/* Email */}
                    {rowData?.employee?.email && (
                        <div className="hc-employee-contact">
                            <i className="pi pi-envelope"></i>
                            <span>{rowData?.employee?.email}</span>
                            <i className="pi pi-phone"></i>
                            <span>{rowData?.employee?.mobile}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

// employee name template ( link, canView check needed)
export const employeeNameTemplate = (rowData: any) => {
    const employee = rowData?.employee;

    const content = (
        <div className="hc-employee-cell">
            <div className="hc-avatar-wrapper">
                {!cn(employee?.employee_profile_img) ? (
                    <Avatar
                        image={employee?.employee_profile_img}
                        shape="circle"
                        size="large"
                        className="hc-avatar"
                    />
                ) : (
                    <Avatar
                        icon="pi pi-user"
                        shape="circle"
                        size="large"
                        className="hc-avatar hc-avatar-placeholder"
                        style={{
                            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                            color: '#ffffff'
                        }}
                    />
                )}
            </div>
            <div className="hc-employee-info">
                <div className="hc-employee-name">
                    {capitalizeFirstLetter(employee?.first_name)}{' '}
                    {capitalizeFirstLetter(employee?.last_name)}
                </div>
                {employee?.email && (
                    <div className="hc-employee-contact">
                        <i className="pi pi-envelope"></i>
                        <span>{employee?.email}</span>
                        <i className="pi pi-phone"></i>
                        <span>{employee?.mobile}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple employee name template (no link, no canView check needed)
export const myLeaveEmployeeTemplate = (rowData: any) => {
    const employee = rowData?.employee;

    return (
        <div className="hc-employee-cell">
            <div className="hc-avatar-wrapper">
                {!cn(employee?.employee_profile_img) ? (
                    <Avatar
                        image={employee?.employee_profile_img}
                        shape="circle"
                        size="large"
                        className="hc-avatar"
                    />
                ) : (
                    <Avatar
                        icon="pi pi-user"
                        shape="circle"
                        size="large"
                        className="hc-avatar hc-avatar-placeholder"
                        style={{
                            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                            color: '#ffffff'
                        }}
                    />
                )}
            </div>

            <div className="hc-employee-info">
                <div className="hc-employee-name">
                    {capitalizeFirstLetter(employee?.first_name)}{' '} {capitalizeFirstLetter(employee?.last_name)}
                </div>
                {employee?.email && (
                    <div className="hc-employee-contact">
                        <i className="pi pi-envelope"></i>
                        <span>{employee?.email}</span>
                        <i className="pi pi-phone"></i>
                        <span>{employee?.mobile}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
