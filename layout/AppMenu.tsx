"use client";
import React, { memo } from "react";
import { MenuModal } from "../types/layout";
import AppSubMenu from "./AppSubMenu";

export const pciAdminMenuModel: MenuModal[] = [
  {
    label: "National Dashboard",
    icon: "pi pi-fw pi-home",
    to: "/pci-admin/dashboard",
  },
  {
    label: "Council Users",
    icon: "pi pi-fw pi-users",
    to: "/pci-admin/state-council/users",
  },
  {
    label: "Circulars & Notices",
    icon: "pi pi-fw pi-bell",
    to: "/pci-admin/circulars",
  },
  {
    label: "IT Support Desk",
    icon: "pi pi-fw pi-headphones",
    to: "/pci-admin/support",
  },
  {
    label: "REPORTS & ANALYTICS",
    icon: "pi pi-fw pi-chart-bar",
    items: [
      {
        label: "Application Analytics",
        to: "/pci-admin/reports/applications",
      },
      {
        label: "Revenue Analytics",
        to: "/pci-admin/reports/revenue",
      },
      {
        label: "State Comparison",
        to: "/pci-admin/reports/comparison",
      }
    ]
  },
  {
    label: "MASTERS",
    icon: "pi pi-fw pi-database",
    items: [
      {
        label: "Institutions & Colleges",
        to: "/pci-admin/masters/institutions",
      },
      {
        label: "Application Types",
        to: "/pci-admin/masters/application-types",
      },
      {
        label: "Documents",
        to: "/pci-admin/masters/documents",
      },
      {
        label: "Application Mapping",
        to: "/pci-admin/masters/mapping",
      }
    ]
  }
];

const AppMenu = memo(() => {
  return <AppSubMenu model={pciAdminMenuModel} />;
});

AppMenu.displayName = "AppMenu";

export default AppMenu;