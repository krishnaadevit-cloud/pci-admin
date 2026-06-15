'use client';


import React, { useState } from 'react';
import { Breadcrumb, LayoutConfig, LayoutContextProps, GlobalFilterState } from '../../types/layout';
import { ChildContainerProps } from '@/types';

export const LayoutContext = React.createContext({} as LayoutContextProps);

export const LayoutProvider = (props: ChildContainerProps) => {
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
    const [globalFilterState, setGlobalFilterState] = useState<GlobalFilterState>({
        stateId: 'all',
        dateRange: [new Date(2024, 4, 1), new Date(2024, 4, 20)]
    });
    const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
        ripple: false,
        inputStyle: 'outlined',
        menuMode: 'static',
        colorScheme: 'light',
        theme: 'blue',
        themeColor: "#0F8BFD",
        scale: 14
    });

    const [layoutState, setLayoutState] = useState({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        overlaySubmenuActive: false,
        rightMenuVisible: false,
        configSidebarVisible: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
        searchBarActive: false,
        resetMenu: false,
        sidebarActive: false,
        anchored: false,
        rightMenuActive: false,
        loading: true
    });


    React.useEffect(() => {
        const config = localStorage.getItem('pci-layout-config');
        if (config) {
            const parsed = JSON.parse(config);
            // Always default to light theme regardless of what was saved
            setLayoutConfig({ ...parsed, colorScheme: 'light' });
        }
        const state = localStorage.getItem('pci-layout-state');
        if (state) {
            const parsedState = JSON.parse(state);
            // Only restore certain properties to avoid UI glitches (e.g. don't restore open sidebars if not needed)
            setLayoutState(prev => ({
                ...prev,
                staticMenuDesktopInactive: parsedState.staticMenuDesktopInactive,
                anchored: parsedState.anchored
            }));
        }
    }, []);

    React.useEffect(() => {
        localStorage.setItem('pci-layout-config', JSON.stringify(layoutConfig));
    }, [layoutConfig]);

    React.useEffect(() => {
        localStorage.setItem('pci-layout-state', JSON.stringify({
            staticMenuDesktopInactive: layoutState.staticMenuDesktopInactive,
            anchored: layoutState.anchored
        }));
    }, [layoutState.staticMenuDesktopInactive, layoutState.anchored]);

    const isOverlay = React.useCallback(() => {
        return layoutConfig.menuMode === 'overlay';
    }, [layoutConfig.menuMode]);

    const isSlim = React.useCallback(() => {
        return layoutConfig.menuMode === 'slim';
    }, [layoutConfig.menuMode]);

    const isSlimPlus = React.useCallback(() => {
        return layoutConfig.menuMode === 'slim-plus';
    }, [layoutConfig.menuMode]);

    const isHorizontal = React.useCallback(() => {
        return layoutConfig.menuMode === 'horizontal';
    }, [layoutConfig.menuMode]);

    const isDesktop = React.useCallback(() => {
        return window.innerWidth > 991;
    }, []);

    const onMenuToggle = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (isOverlay()) {
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                overlayMenuActive: !prevLayoutState.overlayMenuActive
            }));
        }
        if (isDesktop()) {
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                staticMenuDesktopInactive: !prevLayoutState.staticMenuDesktopInactive
            }));
        } else {
            setLayoutState((prevLayoutState) => ({
                ...prevLayoutState,
                staticMenuMobileActive: !prevLayoutState.staticMenuMobileActive
            }));

            event.preventDefault();
        }
    }, [isOverlay, isDesktop]);

    const hideOverlayMenu = React.useCallback(() => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            overlayMenuActive: false,
            staticMenuMobileActive: false
        }));
    }, []);

    const toggleSearch = React.useCallback(() => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            searchBarActive: !prevLayoutState.searchBarActive
        }));
    }, []);

    const onSearchHide = React.useCallback(() => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            searchBarActive: false
        }));
    }, []);

    const showRightSidebar = React.useCallback(() => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            rightMenuActive: true
        }));
        hideOverlayMenu();
    }, [hideOverlayMenu]);

    const showConfigSidebar = React.useCallback(() => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            configSidebarVisible: true
        }));
    }, []);

    const showSidebar = React.useCallback(() => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            rightMenuVisible: true
        }));
    }, []);

    const setLoading = React.useCallback((value: boolean) => {
        setLayoutState((prevLayoutState) => ({
            ...prevLayoutState,
            loading: value
        }));
    }, []);

    const value = React.useMemo(() => ({
        layoutConfig,
        setLayoutConfig,
        layoutState,
        setLayoutState,
        globalFilterState,
        setGlobalFilterState,
        isSlim,
        isSlimPlus,
        isHorizontal,
        isDesktop,
        onMenuToggle,
        toggleSearch,
        onSearchHide,
        showRightSidebar,
        breadcrumbs,
        setBreadcrumbs,
        showConfigSidebar,
        showSidebar,
        setLoading
    }), [layoutConfig, layoutState, globalFilterState, isSlim, isSlimPlus, isHorizontal, isDesktop, breadcrumbs, setLoading]);

    return (
        <LayoutContext.Provider value={value}>
            <>
               
                {props.children}
            </>
        </LayoutContext.Provider>
    );
};
