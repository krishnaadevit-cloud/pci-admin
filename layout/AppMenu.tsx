"use client";
import React, { memo } from "react";
import { MenuModal } from "../types/layout";
import AppSubMenu from "./AppSubMenu";

export const menuModel: MenuModal[] = [
  {
    label: "",
    icon: "pi pi-fw pi-users",
    items: [
      {
        label: "Dashboard",
        icon: "pi pi-fw pi-home",
        to: "/super-admin/dashboard",
      },
      {
        label: "State Councils",
        icon: "pi pi-fw pi-map",
        to: "/super-admin/state-council/haryana",
      },
      {
        label: "Council Users",
        icon: "pi pi-fw pi-users",
        to: "/super-admin/state-council/users",
      },
      {
        label: "Applications Grid",
        icon: "pi pi-fw pi-briefcase",
        to: "/super-admin/applications/state-wise/haryana",
      },
      {
        label: "REPORTS & ANALYTICS",
        icon: "pi pi-fw pi-chart-bar",
        items: [
          {
            label: "Application Analytics",
            to: "/super-admin/reports/applications",
          },
          {
            label: "Revenue Analytics",
            to: "/super-admin/reports/revenue",
          },
          {
            label: "State Comparison",
            to: "/super-admin/reports/comparison",
          }
        ]
      },
      {
        label: "MASTERS",
        icon: "pi pi-fw pi-database",
        items: [
          {
            label: "Application Types",
            to: "/super-admin/masters/application-types",
          },
          {
            label: "Documents",
            to: "/super-admin/masters/documents",
          },
          {
            label: "Application Mapping",
            to: "/super-admin/masters/mapping",
          }
        ]
      }
    ],
  },
];

const AppMenu = memo(() => {
  return <AppSubMenu model={menuModel} />;
});

export default AppMenu;
