'use client';

import Link from 'next/link';
import { useContext, useEffect, memo } from 'react';
import AppMenu from './AppMenu';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import { classNames } from 'primereact/utils';

const AppSidebar = memo((props: { sidebarRef: React.RefObject<HTMLDivElement> }) => {
    const { setLayoutState, layoutConfig, layoutState } = useContext(LayoutContext);
    const anchor = () => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            anchored: !prevLayoutState.anchored
        }));
    };

    useEffect(() => {
        return () => {
            resetOverlay();
        };
    }, []);

    const resetOverlay = () => {
        if (layoutState.overlayMenuActive) {
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                overlayMenuActive: false
            }));
        }
    };

    let timeout = null;

    const onMouseEnter = () => {
        if (!layoutState.anchored) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                sidebarActive: true
            }));
        }
    };

    const onMouseLeave = () => {
        if (!layoutState.anchored) {
            if (!timeout) {
                timeout = setTimeout(
                    () =>
                        setLayoutState((prevLayoutState) => ({
                            ...prevLayoutState,
                            sidebarActive: false
                        })),
                    300
                );
            }
        }
    };

    return (
        <>
            <div ref={props.sidebarRef} className="layout-sidebar" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
                
                {/* Sidebar Header with PCI Logo and Name */}
                <div className="flex align-items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', minHeight: '70px', display: 'flex', alignItems: 'center' }}>
                    <img src="/layout/images/logo/pci-logo.png" alt="PCI Logo" style={{ height: '36px', width: '36px' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <div className="flex flex-column">
                        <span className="text-xs font-bold text-white tracking-wider" style={{ lineHeight: 1.2, display: 'block', fontSize: '10.5px' }}>PHARMACY COUNCIL</span>
                        <span className="text-xs font-bold text-white tracking-wider" style={{ lineHeight: 1.2, display: 'block', fontSize: '10.5px' }}>OF INDIA (PCI)</span>
                    </div>
                </div>
             
                <div className="layout-menu-container">
                    <MenuProvider>
                        <AppMenu />
                    </MenuProvider>
                </div>
            </div>
        </>
    );

});

export default AppSidebar;
