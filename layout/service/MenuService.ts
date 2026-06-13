import { MenuModal } from '@/types';

export const menuModel: MenuModal[] = [
    {
        label: 'Dashboards',
        icon: 'pi pi-home',
        items: [
            {
                label: 'E-Commerce',
                icon: 'pi pi-fw pi-home',
                to: '/'
            }
        ]
    },
    { separator: true },
    {
        label: 'Institute',
        icon: 'pi pi-graduation-cap',
        items: [
            {
                label: 'Login',
                icon: 'pi pi-fw pi-lock',
                to: '/institute/login'
            },
            {
                label: 'Dashboard',
                icon: 'pi pi-fw pi-chart-bar',
                to: '/institute/dashboard'
            },
            {
                label: 'My Profile',
                icon: 'pi pi-fw pi-user',
                to: '/institute/profile'
            }
        ]
    },
    { separator: true },
    {
        label: 'Apps',
        icon: 'pi pi-th-large',
        items: [
            {
                label: 'Blog',
                icon: 'pi pi-fw pi-comment',
                items: [
                    {
                        label: 'List',
                        icon: 'pi pi-fw pi-image',
                        to: '/apps/blog/list'
                    },
                ]
            }
        ]
    }
];
