'use client';
import React, { useCallback, useEffect, useRef, useContext } from 'react';
import { classNames, DomHandler } from 'primereact/utils';
import { usePathname, useSearchParams } from 'next/navigation';
import { LayoutContext } from './context/layoutcontext';
import { useEventListener, useMountEffect, useResizeListener, useUnmountEffect } from 'primereact/hooks';
import AppTopbar from './AppTopbar';
import AppConfig from './AppConfig';
import { PrimeReactContext } from 'primereact/api';

import { Tooltip } from 'primereact/tooltip';
import { ChildContainerProps } from '@/types';
import { Toast } from 'primereact/toast';
import AppProfileMenu from './AppProfileMenu';
import AppTabs from './AppTabs';

const Layout = (props: ChildContainerProps) => {
    const { layoutConfig, layoutState, setLayoutState, isSlim, isSlimPlus, isHorizontal, isDesktop, setLoading } = useContext(LayoutContext);

    const { setRipple } = useContext(PrimeReactContext);
    const topbarRef = useRef(null);
    const sidebarRef = useRef(null);
    const copyTooltipRef = useRef(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [bindMenuOutsideClickListener, unbindMenuOutsideClickListener] = useEventListener({
        type: 'click',
        listener: (event) => {
            const isOutsideClicked = !(sidebarRef.current.isSameNode(event.target) || sidebarRef.current.contains(event.target) || topbarRef.current.menubutton.isSameNode(event.target) || topbarRef.current.menubutton.contains(event.target));

            if (isOutsideClicked) {
                hideMenu();
            }
        }
    });

    const [bindDocumentResizeListener, unbindDocumentResizeListener] = useResizeListener({
        listener: () => {
            if (isDesktop() && !DomHandler.isTouchDevice()) {
                hideMenu();
            }
        }
    });

    const hideMenu = useCallback(() => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            overlayMenuActive: false,
            overlaySubmenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false,
            menuClick: false,
            resetMenu: (isSlim() || isSlimPlus() || isHorizontal()) && isDesktop()
        }));
    }, [isSlim, isHorizontal, isDesktop, setLayoutState]);

    const blockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    };

    const unblockBodyScroll = () => {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    };
    useMountEffect(() => {
        setRipple(layoutConfig.ripple);
    });

    useEffect(() => {
        const root = document.documentElement;
        if (layoutConfig.themeColor) {
            root.style.setProperty('--color-primary', layoutConfig.themeColor);
            root.style.setProperty('--color-primary-dark', layoutConfig.themeColor); // Could use a darker shade here
            root.style.setProperty('--color-primary-light', `${layoutConfig.themeColor}22`); // 13% opacity
            root.style.setProperty('--shadow-btn', `0 2px 6px ${layoutConfig.themeColor}59`); // 35% opacity

            // Also set --primary-color to fix the layout colors (topbar, sidebar, active links)
            root.style.setProperty('--primary-color', layoutConfig.themeColor);
            root.style.setProperty('--primary-color-text', '#ffffff'); // Optional: enforce white text on primary color elements

            // Convert hex to rgb for rgba usage
            const hex = layoutConfig.themeColor.replace('#', '');
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            root.style.setProperty('--color-primary-rgb', `${r} ${g} ${b}`);
        }
    }, [layoutConfig.themeColor]);

    useEffect(() => {
        if (layoutState.overlayMenuActive || layoutState.staticMenuMobileActive || layoutState.overlaySubmenuActive) {
            bindMenuOutsideClickListener();
        }

        if (layoutState.staticMenuMobileActive) {
            blockBodyScroll();
            (isSlim() || isSlimPlus() || isHorizontal()) && bindDocumentResizeListener();
        }

        return () => {
            unbindMenuOutsideClickListener();
            unbindDocumentResizeListener();
            unblockBodyScroll();
        };
    }, [layoutState.overlayMenuActive, layoutState.staticMenuMobileActive, layoutState.overlaySubmenuActive]);

    useEffect(() => {
        const onRouteChange = () => {
            hideMenu();
            setLoading(false);
        };
        onRouteChange();
    }, [pathname, searchParams, hideMenu, setLoading]);

    // Handle horizontal scroll on tabs with mouse wheel
    useEffect(() => {
        const tabsContainer = document.querySelector('.layout-tabs-container .p-tabmenu-nav');
        
        if (!tabsContainer) return;

        const handleWheel = (e: WheelEvent) => {
            if (tabsContainer.scrollWidth <= tabsContainer.clientWidth) return;
            
            e.preventDefault();
            tabsContainer.scrollLeft += (e.deltaY > 0 ? 1 : -1) * 160;
        };

        tabsContainer.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            tabsContainer.removeEventListener('wheel', handleWheel);
        };
    }, [pathname]); // Re-run on route change

    // Handle auto-scroll on hover edges
    useEffect(() => {
        const tabsContainer = document.querySelector('.layout-tabs-container .p-tabmenu-nav');
        
        if (!tabsContainer) return;

        let scrollInterval: NodeJS.Timeout | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = tabsContainer.getBoundingClientRect();
            const scrollThreshold = 50; // pixels from edge to trigger scroll
            const scrollSpeed = 5; // pixels per interval

            // Clear existing interval
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }

            // Check if on left edge
            if (e.clientX - rect.left < scrollThreshold && tabsContainer.scrollLeft > 0) {
                scrollInterval = setInterval(() => {
                    tabsContainer.scrollLeft -= scrollSpeed;
                }, 20);
            }
            // Check if on right edge
            else if (rect.right - e.clientX < scrollThreshold && tabsContainer.scrollLeft < tabsContainer.scrollWidth - tabsContainer.clientWidth) {
                scrollInterval = setInterval(() => {
                    tabsContainer.scrollLeft += scrollSpeed;
                }, 20);
            }
        };

        const handleMouseLeave = () => {
            if (scrollInterval) {
                clearInterval(scrollInterval);
                scrollInterval = null;
            }
        };

        tabsContainer.addEventListener('mousemove', handleMouseMove);
        tabsContainer.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            tabsContainer.removeEventListener('mousemove', handleMouseMove);
            tabsContainer.removeEventListener('mouseleave', handleMouseLeave);
            if (scrollInterval) clearInterval(scrollInterval);
        };
    }, [pathname]); // Re-run on route change


    useUnmountEffect(() => {
        unbindMenuOutsideClickListener();
    });

    const containerClassName = classNames('layout-wrapper', {
        'layout-light': layoutConfig.colorScheme === 'light',
        'layout-dark': layoutConfig.colorScheme === 'dark',
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-slim': layoutConfig.menuMode === 'slim',
        'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
        'layout-horizontal': layoutConfig.menuMode === 'horizontal',
        'layout-reveal': layoutConfig.menuMode === 'reveal',
        'layout-drawer': layoutConfig.menuMode === 'drawer',
        'layout-static-inactive': layoutState.staticMenuDesktopInactive && layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive,
        'p-ripple-disabled': !layoutConfig.ripple,
        'layout-sidebar-active': layoutState.sidebarActive,
        'layout-sidebar-anchored': layoutState.anchored
    });

    return (
        <div className={classNames('layout-container', containerClassName)} data-theme={layoutConfig.colorScheme}>
            <Tooltip ref={copyTooltipRef} target=".block-action-copy" position="bottom" content="Copied to clipboard" event="focus" />

           

            <Tooltip target=".layout-tabs-container" position="bottom" content="Scroll to see more tabs" event="hover" />

            <AppTopbar ref={topbarRef} sidebarRef={sidebarRef} />
            <div className="layout-content-wrapper" style={{ marginTop: '69px' }}>
                <AppTabs />

                <div className="layout-content" style={{ padding: '1.5rem 2rem' }}>
                    {props.children}
                </div>

                <div className="layout-mask"></div>
            </div>
            <AppProfileMenu />
            <AppConfig />

            <Toast></Toast>
        </div>
    );
};

export default Layout;