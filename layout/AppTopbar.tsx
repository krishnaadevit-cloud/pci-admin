'use client';

import React, { forwardRef, useImperativeHandle, useContext, useRef, useState } from 'react';
import { clearUser, clearPending, clearOtpFlowCookies, clearAuthToken } from "@/lib/auth/cookieStorage";
import { useRouter } from 'next/navigation';
import { LayoutContext } from './context/layoutcontext';
import AppSidebar from './AppSidebar';
import { Ripple } from 'primereact/ripple';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Nullable } from 'primereact/ts-helpers';

const AppTopbar = forwardRef((props: { sidebarRef: React.RefObject<HTMLDivElement> }, ref) => {

    const btnRef1 = useRef(null);
    const menubuttonRef = useRef(null);
    const menu = useRef<Menu>(null);

    const router = useRouter();

    const { onMenuToggle, showConfigSidebar, showSidebar, layoutConfig, setLayoutState, globalFilterState, setGlobalFilterState } = useContext(LayoutContext);

    const menuItems = [
        {
            label: 'Change Password',
            icon: 'pi pi-lock',
            command: () => { router.push('/office-portal/change-password'); }
        },
        {
            label: 'Reload',
            icon: 'pi pi-refresh',
            command: () => {
                window.location.reload();
            }
        },
        {
            label: 'Toggle Full Width',
            icon: 'pi pi-window-maximize',
            command: () => {
                setLayoutState((prevLayoutState) => ({
                    ...prevLayoutState,
                    staticMenuDesktopInactive: true,
                    staticMenuMobileActive: false
                }));
            }
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
                // Clear auth token cookie directly (SameSite=Strict, JS-readable).
                clearAuthToken();
                // Clear auth cookies (pci_auth_user, pci_pending, pci_otp_*).
                clearUser();
                clearPending();
                clearOtpFlowCookies();
                // Also clear RBAC permission cache from sessionStorage.
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('module_actions');
                }
                // localStorage is intentionally NOT cleared — pci-layout-config,
                // pci-layout-state preferences are preserved across sessions.
                router.push('/pharmacy/login');
            }
        }
    ];

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current
    }));



    return (
        <React.Fragment>
            <div className="layout-topbar" style={{ position: 'fixed', top: 0, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', left: '0', width: '100%', zIndex: 999, transition: 'all 0.3s ease' }}>

                {/* Left side: Menu Toggle & Logo */}
                <div className="flex align-items-center gap-3">
                    <button ref={btnRef1} type="button" className="p-ripple p-link p-trigger text-gray-700 hover:surface-hover transition-all duration-300 border-circle hover:shadow-2" onClick={onMenuToggle} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', transform: 'scale(1)' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                        <i className="pi pi-bars text-xl" style={{ margin: 'auto', color: '#334155' }}></i>
                        <Ripple />
                    </button>

                    <div className="flex align-items-center gap-2 ml-2">
                        <img src="/layout/images/logo/pci-logo.png" alt="Logo" style={{ height: '35px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                </div>
                <AppSidebar sidebarRef={props.sidebarRef} />

                {/* Center: Global Filters & Search */}
                <div className="flex-1 flex justify-content-center align-items-center gap-3">
                    <Dropdown 
                        value={globalFilterState?.stateId || 'all'} 
                        options={[
                            { label: 'All States (National)', value: 'all' },
                            { label: 'Uttar Pradesh', value: 'uttar-pradesh' },
                            { label: 'Maharashtra', value: 'maharashtra' },
                            { label: 'Karnataka', value: 'karnataka' },
                            { label: 'Gujarat', value: 'gujarat' },
                            { label: 'Haryana', value: 'haryana' },
                            { label: 'Kerala', value: 'kerala' },
                            { label: 'Rajasthan', value: 'rajasthan' },
                            { label: 'Tamil Nadu', value: 'tamil-nadu' },
                            { label: 'Delhi', value: 'delhi' }
                        ]} 
                        onChange={(e) => setGlobalFilterState({ ...globalFilterState, stateId: e.value })} 
                        className="w-full md:w-14rem" 
                        style={{ borderRadius: '20px', fontSize: '0.9rem', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                    />
                    <Calendar
                        value={globalFilterState?.dateRange || null}
                        onChange={(e) => setGlobalFilterState({ ...globalFilterState, dateRange: e.value as Nullable<(Date | null)[]> })}
                        selectionMode="range"
                        readOnlyInput
                        dateFormat="dd M y"
                        className="w-full md:w-15rem"
                        inputStyle={{ borderRadius: '20px', fontSize: '0.9rem', border: '1px solid #e2e8f0', background: '#f8fafc', padding: '0.55rem 1rem' }}
                        showIcon
                    />
                    <span className="p-input-icon-left topbar-search" style={{ width: '100%', maxWidth: '250px' }}>
                        <i className="pi pi-search" style={{ color: '#94a3b8', left: '1rem' }}></i>
                        <InputText
                            placeholder="Search..."
                            className="w-full"
                            style={{
                                borderRadius: '20px',
                                border: '1px solid #e2e8f0',
                                padding: '0.55rem 1rem 0.55rem 2.5rem',
                                background: '#EEF3F8',
                                color: '#1e293b',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.borderColor = 'var(--primary-color)';
                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.15)';
                                (e.currentTarget.previousSibling as HTMLElement).style.color = 'var(--primary-color)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.boxShadow = 'none';
                                (e.currentTarget.previousSibling as HTMLElement).style.color = '#94a3b8';
                            }}
                        />
                    </span>
                </div>

                {/* Right side: Icons and Avatar */}
                <div className="flex align-items-center gap-4">

                    {/* Bell/Notification Icon */}
                    <button type="button" className="p-link text-gray-500 hover:text-gray-800 transition-colors cursor-pointer relative" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="pi pi-bell text-xl"></i>
                        {/* Optional badge dot */}
                        <span className="absolute bg-red-500 border-circle" style={{ width: '8px', height: '8px', top: '4px', right: '4px' }}></span>
                    </button>

                    {/* Avatar */}
                    <Menu model={menuItems} popup ref={menu} id="profile_menu" />
                    <div
                        className="flex align-items-center justify-content-center text-white font-bold cursor-pointer transition-all duration-300"
                        onClick={(e) => menu.current?.toggle(e)}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #0F8BFD 0%, #6366f1 100%)',
                            borderRadius: '50%',
                            fontSize: '16px',
                            border: '2px solid #ffffff',
                            boxShadow: '0 2px 8px rgba(15, 139, 253, 0.2)'
                        }}
                    >
                        <img src="/layout/images/avatar/avatar-m-1.jpg" alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = 'D';
                        }} />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
});

export default AppTopbar;
