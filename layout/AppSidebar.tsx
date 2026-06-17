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
