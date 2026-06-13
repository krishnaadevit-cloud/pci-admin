'use client';

import React, { useMemo } from 'react';
import { TabMenu } from 'primereact/tabmenu';
import { usePathname, useRouter } from 'next/navigation';
import { menuModel } from './AppMenu';

const AppTabs = () => {
    const pathname = usePathname();
    const router = useRouter();

    const isMatch = (item: any, currentPath: string): boolean => {
        if (item.to && (currentPath === item.to || (item.to !== '/' && currentPath.startsWith(item.to)))) {
            return true;
        }
        if (item.items) {
            return item.items.some((child: any) => isMatch(child, currentPath));
        }
        return false;
    };

    const activeGroups = useMemo(() => {
        if (!pathname) return [];

        const allMenuItems = menuModel.filter((m) => m.items).flatMap((m) => m.items ?? []);
        const groups: any[][] = [];

        const search = (currentItems: any[]) => {
            for (const item of currentItems) {
                if (item.items && isMatch(item, currentPath)) {
                    // We only want the groups under "Application" for the multi-tier tab look
                    // or any group that has children matching the path.
                    groups.push(item.items);
                    search(item.items);
                    break;
                }
            }
        };

        const currentPath = pathname;
        search(allMenuItems);
        return groups;
    }, [pathname]);

    if (!activeGroups || activeGroups.length === 0) return null;

    const renderTabLevel = (items: any[], level: number) => {
        const tabItems = items.map((item: any) => ({
            label: item.label,
            _to: item.to,
            _item: item,
            command: () => {
                if (item.to) router.push(item.to);
            }
        }));

        const activeIndex = tabItems.findIndex(item => {
            if (item._to && (pathname === item._to || (item._to !== '/' && pathname.startsWith(item._to)))) {
                return true;
            }
            return isMatch(item._item, pathname);
        });

        const finalActiveIndex = activeIndex === -1 ? 0 : activeIndex;

        return (
            <div key={`tab-level-${level}`} className={`layout-tabs-level-${level} ${level === 0 ? 'layout-tabs-container' : 'layout-tabs-sub-container'}`}>
                <TabMenu key={`${pathname}-${level}`} model={tabItems} activeIndex={finalActiveIndex} />
            </div>
        );
    };

    return (
        <div className="layout-tabs-wrapper">
            {activeGroups.slice(0, 2).map((group, index) => renderTabLevel(group, index))}
        </div>
    );
};

export default AppTabs;
