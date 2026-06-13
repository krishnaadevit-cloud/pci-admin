import React, { createContext, useState } from 'react';
import type { MenuContextProps } from '@/types';

export const MenuContext = createContext({} as MenuContextProps);

interface MenuProviderProps {
    children: React.ReactNode;
}

const STORAGE_KEY = 'prts_active_menu';

export const MenuProvider = (props: MenuProviderProps) => {
    const [activeMenu, setActiveMenuState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(STORAGE_KEY) ?? '';
        }
        return '';
    });

    const setActiveMenu = (value: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, value);
        }
        setActiveMenuState(value);
    };

    const value = React.useMemo(() => ({
        activeMenu,
        setActiveMenu
    }), [activeMenu]);

    return <MenuContext.Provider value={value}>{props.children}</MenuContext.Provider>;
};
