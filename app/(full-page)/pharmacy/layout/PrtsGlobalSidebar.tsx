"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { useDashboardSidebar } from "../DashboardSidebarContext";
import PrtsDashboardSidebar from "../dashboard/PrtsDashboardSidebar";

export default function PrtsGlobalSidebar() {
  const { isAuthenticated } = useAuth();
  const sidebar = useDashboardSidebar();
  const pathname = usePathname();
  const usesInlineSidebar =
    pathname.startsWith("/pharmacy/dashboard") ||
    pathname.startsWith("/pharmacy/fresh-registration") ||
    pathname.startsWith("/pharmacy/renewal") ||
    pathname.startsWith("/pharmacy/re-entry") ||
    pathname.startsWith("/pharmacy/add-qualification") ||
    pathname.startsWith("/pharmacy/change-address") ||
    pathname.startsWith("/pharmacy/change-name") ||
    pathname.startsWith("/pharmacy/duplicate-certificate") ||
    pathname.startsWith("/pharmacy/good-standing-certificate");

  if (!isAuthenticated || usesInlineSidebar) {
    return null;
  }

  return (
    <>
      <div
        className={`prts-sidebar-overlay ${
          sidebar?.isOpen ? "prts-sidebar-overlay--visible" : ""
        }`}
        onClick={() => sidebar?.setIsOpen(false)}
        role="presentation"
        aria-hidden={!sidebar?.isOpen}
      />
      <PrtsDashboardSidebar isOpen={sidebar?.isOpen ?? false} />
    </>
  );
}
