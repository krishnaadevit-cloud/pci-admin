'use client';

import React, { forwardRef, useImperativeHandle, useContext, useRef, useState, useEffect } from 'react';
import { clearUser, clearPending, clearOtpFlowCookies, clearAuthToken, getCouncilLogo, clearCouncilLogo, clearTenantStatus } from "@/lib/auth/cookieStorage";
import { useRouter, usePathname } from 'next/navigation';
import { LayoutContext } from './context/layoutcontext';
import AppSidebar from './AppSidebar';
import { InputText } from 'primereact/inputtext';
import { Menu } from 'primereact/menu';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';



import statesDataRaw from '@/jsondata/states.json';

function safeJson(raw: any) {
    if (!raw) return raw;
    if (typeof raw === 'object' && raw.default !== undefined) {
        const keys = Object.keys(raw);
        const hasOtherKeys = keys.some(k => k !== 'default' && k !== '__esModule');
        if (!hasOtherKeys) return raw.default;
    }
    return raw;
}
const statesData = safeJson(statesDataRaw);

const AppTopbar = forwardRef((props: { sidebarRef: React.RefObject<HTMLDivElement> }, ref) => {
    const menubuttonRef = useRef(null);
    const menu = useRef<Menu>(null);
    const toast = useRef<Toast>(null);

    const router = useRouter();
    const pathname = usePathname();

    const { onMenuToggle, showConfigSidebar, showSidebar, layoutConfig, setLayoutState, globalFilterState, setGlobalFilterState } = useContext(LayoutContext);

    const [searchValue, setSearchValue] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [councilLogo, setCouncilLogo] = useState<string | null>(null);

    const stateOptions = React.useMemo(() => {
        return (statesData || []).map((s: any) => ({
            label: s.id === 'all' ? 'All States (National)' : s.name,
            value: s.id
        }));
    }, []);

    useEffect(() => {
        setCouncilLogo(getCouncilLogo());
    }, []);

    // Sync globalFilterState.stateId with the URL path
    useEffect(() => {
        if (pathname.startsWith('/pci-admin/state-council/')) {
            const parts = pathname.split('/');
            const stateIdFromPath = parts[parts.length - 1];
            if (stateIdFromPath && globalFilterState?.stateId !== stateIdFromPath) {
                setGlobalFilterState(prev => ({ ...prev, stateId: stateIdFromPath }));
            }
        } else if (pathname.startsWith('/pci-admin/applications/state-wise/')) {
            const parts = pathname.split('/');
            const stateIdFromPath = parts[parts.length - 1];
            if (stateIdFromPath && globalFilterState?.stateId !== stateIdFromPath) {
                setGlobalFilterState(prev => ({ ...prev, stateId: stateIdFromPath }));
            }
        } else if (pathname === '/pci-admin/dashboard') {
            if (globalFilterState?.stateId !== 'all') {
                setGlobalFilterState(prev => ({ ...prev, stateId: 'all' }));
            }
        }
    }, [pathname, globalFilterState?.stateId]);

    const handleStateChange = (val: string) => {
        setGlobalFilterState({ ...globalFilterState, stateId: val });
        if (pathname.startsWith('/pci-admin/applications/state-wise/')) {
            if (val === 'all') {
                router.push('/pci-admin/applications/state-wise/all');
            } else {
                router.push(`/pci-admin/applications/state-wise/${val}`);
            }
        } else if (pathname.startsWith('/pci-admin/reports/')) {
            // Keep on current page, data updates reactively via context
        } else {
            if (val === 'all') {
                router.push('/pci-admin/dashboard');
            } else {
                router.push(`/pci-admin/state-council/${val}`);
            }
        }
    };

    const handleSearch = async () => {
        const trimmed = searchValue.trim();
        if (!trimmed) {
            toast.current?.show({ severity: 'warn', summary: 'Search Required', detail: 'Please enter a search term.', life: 3000 });
            return;
        }
        setIsSearching(true);
        try {
            const data = await getWithParams(GET_PHARMACISTS_DATA, { search: trimmed });
            const list = data?.application_list || [];
            if (!list.length) {
                toast.current?.show({ severity: 'warn', summary: 'Not Found', detail: 'No pharmacist found for the given search term.', life: 3000 });
                return;
            }
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('pharmacist_search_data', JSON.stringify(data));
            }
            router.push('/office-portal/pharmacist-profile');
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Search Failed', detail: 'Unable to fetch pharmacist data. Please try again.', life: 3000 });
        } finally {
            setIsSearching(false);
        }
    };

    const menuItems = [
        {
            label: 'View Profile',
            icon: 'pi pi-user',
            command: () => { router.push('/office-portal/view-profile'); }
        },
        {
            label: 'Change Password',
            icon: 'pi pi-lock',
            command: () => { router.push('/office-portal/change-password'); }
        },
        {
            label: 'Logout',
            icon: 'pi pi-sign-out',
            command: () => {
                clearAuthToken();
                clearUser();
                clearPending();
                clearOtpFlowCookies();
                clearTenantStatus();
                clearCouncilLogo();
                if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('module_actions');
                }
                router.push('/pharmacy/login');
            }
        }
    ];

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current
    }));

    return (
        <React.Fragment>
            <Toast ref={toast} />
            <div
                className="layout-topbar"
                style={{
                    position: 'fixed', top: 0, backgroundColor: '#ffffff',
                    borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                    height: '70px', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '0 1rem',
                    left: '0', width: '100%', zIndex: 999, transition: 'all 0.3s ease'
                }}
            >
                {/* Left side: Logo */}
                <div className="flex align-items-center gap-3">
                    <div className="flex align-items-center">
                        <img
                            src="/layout/images/logo/pci-logo.png"
                            alt="Logo"
                            style={{ height: '35px' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>
                </div>

                <AppSidebar sidebarRef={props.sidebarRef} />

                {/* Center: pci-admin → Dropdown + plain Search; office-portal → pharmacist Search */}
                {pathname.startsWith('/pci-admin') ? (
                    <div className="flex-1 flex justify-content-center align-items-center gap-3">
                        <Dropdown
                            value={globalFilterState?.stateId || 'all'}
                            options={stateOptions}
                            filter
                            onChange={(e) => handleStateChange(e.value)}
                            className="w-full md:w-14rem"
                            style={{
                                borderRadius: '20px', fontSize: '0.9rem',
                                border: '1px solid #e2e8f0', background: '#f8fafc', maxWidth: '300px'
                            }}
                        />
                        <span className="p-input-icon-left topbar-search" style={{ width: '100%', maxWidth: '250px' }}>
                            <i className="pi pi-search" style={{ color: '#94a3b8', left: '1rem' }} />
                            <InputText
                                placeholder="Search..."
                                className="w-full"
                                style={{
                                    borderRadius: '20px', border: '1px solid #e2e8f0',
                                    padding: '0.55rem 1rem 0.55rem 2.5rem',
                                    background: '#EEF3F8', color: '#1e293b',
                                    transition: 'all 0.3s ease', outline: 'none', fontSize: '0.9rem'
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
                ) : (
                    <div className="flex-1 flex justify-content-center">
                        <span className="p-input-icon-left topbar-search" style={{ width: '100%', maxWidth: '400px' }}>
                            <i
                                className={`pi ${isSearching ? 'pi-spin pi-spinner' : 'pi-search'}`}
                                style={{ color: '#94a3b8', left: '1rem' }}
                            />
                            <InputText
                                placeholder="Search by File Number or Registration Number"
                                className="w-full"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                                disabled={isSearching}
                                style={{
                                    borderRadius: '20px', border: '1px solid #e2e8f0',
                                    padding: '0.55rem 1rem 0.55rem 2.5rem',
                                    background: '#EEF3F8', color: '#1e293b',
                                    transition: 'all 0.3s ease', outline: 'none', fontSize: '0.9rem'
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
                )}

                {/* Right side: Notification Bell + Avatar */}
                <div className="flex align-items-center gap-4">
                    <button
                        type="button"
                        className="p-link text-gray-500 hover:text-gray-800 transition-colors cursor-pointer relative"
                        style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <i className="pi pi-bell text-xl"></i>
                        <span className="absolute bg-red-500 border-circle" style={{ width: '8px', height: '8px', top: '4px', right: '4px' }}></span>
                    </button>

                    <Menu model={menuItems} popup ref={menu} id="profile_menu" />
                    <div
                        className="flex align-items-center justify-content-center text-white font-bold cursor-pointer transition-all duration-300"
                        onClick={(e) => menu.current?.toggle(e)}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        style={{
                            width: '40px', height: '40px',
                            background: 'linear-gradient(135deg, #0F8BFD 0%, #6366f1 100%)',
                            borderRadius: '50%', fontSize: '16px',
                            border: '2px solid #ffffff',
                            boxShadow: '0 2px 8px rgba(15, 139, 253, 0.2)'
                        }}
                    >
                        <img
                            src="/layout/images/avatar/avatar-m-1.jpg"
                            alt="Profile"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = 'D';
                            }}
                        />
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
});

export default AppTopbar;