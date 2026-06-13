"use client";

import { usePathname } from "next/navigation";
import { ObjectUtils, classNames } from "primereact/utils";
import React, { useContext, useEffect, useRef, useState, memo } from "react";
import { LayoutContext } from "./context/layoutcontext";
import { Breadcrumb as BreadcrumbType } from "../types/layout";
import { BreadCrumb } from "primereact/breadcrumb";
import Link from "next/link";
import { Button } from "primereact/button";
import { useRouter } from "next/navigation";
import AppAnimatedSearch from "./AppAnimatedSearch";

const AppBreadcrumb = memo(() => {
  const pathname = usePathname();
  const router = useRouter();
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbType | null>(null);
  const { breadcrumbs, showSidebar } = useContext(LayoutContext);

  useEffect(() => {
    const matches =
      breadcrumbs?.filter((crumb) => {
        const crumbSegments = crumb.to.split("/").filter(Boolean);
        const pathSegments = pathname.split("/").filter(Boolean);

        // Route should be prefix of current path
        if (pathSegments.length < crumbSegments.length) {
          return false;
        }

        return crumbSegments.every(
          (seg, i) => seg.startsWith("[") || seg === pathSegments[i],
        );
      }) || [];

    // Prefer the breadcrumb with the most labels (most specific match)
    const filteredBreadcrumb = matches.reduce(
      (prev, current) =>
        prev?.labels.length > current.labels.length ? prev : current,
      matches[0] || null,
    );

    setBreadcrumb(filteredBreadcrumb);
  }, [pathname, breadcrumbs]);

  const onSidebarButtonClick = () => {
    showSidebar();
  };

  const items =
    breadcrumb?.labels.map((label, index) => {
      const isLast = index === breadcrumb.labels.length - 1;
      return {
        label: label,
        template: () => (
          <Link
            href={breadcrumb.to}
            className={classNames("no-underline", {
              "font-bold": isLast,
              "text-600": !isLast,
            })}
            style={isLast ? { color: "#334155" } : {}}
          >
            {label}
          </Link>
        ),
      };
    }) || [];

  const home = {
    icon: "pi pi-home",
    template: () => (
      <Link href="/" className="text-600">
        <i className="pi pi-home"></i>
      </Link>
    ),
  };

  const pageTitle =
    breadcrumb?.labels?.[breadcrumb.labels.length - 1] || "Dashboard";

  const isUserRoleManagement = pathname.includes("/user-role-management/");
  const isRoleManagement = pathname.includes("/role-configuration/");

  // Current URL segments
  const pathSegments = pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];

  // Dynamic route detection
  const isDynamicRoute =
    breadcrumb?.to?.includes("[") ||
    /^\d+$/.test(lastSegment) ||
    /^[0-9a-fA-F-]{8,}$/.test(lastSegment);

  // Pages where back button should not appear
  const rootPages = [
    "/",
    "/dashboard",
    "/office-portal/dashboard",
    "/office-portal/role-permission/user-management",
    "/office-portal/role-permission/role-management",
  ];

  const isRootPage = rootPages.includes(pathname) || pathname.endsWith("/list");

  // Show back button only for actual child pages
  const showBackButton = !isRootPage;

  // Dynamic routes should show parent title
  const displayTitle = isUserRoleManagement
    ? "Configure user permission"
    : isRoleManagement
    ? "Role Configuration"
    : isDynamicRoute
    ? breadcrumb?.labels?.[0] || pageTitle
    : pageTitle === "Dashboard"
    ? "Role Configuration"
    : pageTitle;
  return (
    <div className="layout-breadcrumb flex align-items-center justify-content-between relative h-3rem mb-4 px-1">
      <div className="flex align-items-center gap-3">
        {showBackButton && (
          <Button
            icon="pi pi-arrow-left"
            className="p-button-text p-button-secondary p-button-sm p-0 flex align-items-center justify-content-center"
            style={{
              width: "32px",
              height: "32px",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              background: "#fff",
            }}
            onClick={() => router.back()}
          />
        )}
        <h1 className="text-2xl font-medium m-0 line-height-1 text-black">
          {displayTitle}
        </h1>
      </div>

      <div className="flex align-items-center">
        {!isUserRoleManagement && !isRoleManagement && breadcrumb && (
          <BreadCrumb
            model={items}
            home={home}
            className="bg-transparent border-none p-0 hidden md:block"
            style={{ background: "transparent" }}
          />
        )}
      </div>

      <ul className="breadcrumb-menu flex align-items-center justify-content-end lg:hidden absolute right-0 top-0 z-4 h-3rem w-screen">
        <li className="w-full m-0 ml-3">
          <AppAnimatedSearch className="justify-content-end" />
        </li>
      </ul>
    </div>
  );
});

export default AppBreadcrumb;
