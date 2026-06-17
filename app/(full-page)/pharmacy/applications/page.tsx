"use client";

import PrtsRecentActivity from "../dashboard/PrtsRecentActivity";
import PrtsDashboardSidebar from "../dashboard/PrtsDashboardSidebar";
import { useDashboardSidebar } from "../DashboardSidebarContext";

export default function PrtsDashboard() {
  const sidebar = useDashboardSidebar();
  const sidebarOpen = sidebar?.isOpen ?? false;
  const closeSidebar = () => sidebar?.setIsOpen(false);

  return (
    <div className="prts-pharmacy-dashboard prts-pharmacy-scope">
      <div className="prts-dashboard-wrapper">
        <div
          className={`prts-sidebar-overlay ${
            sidebarOpen ? "prts-sidebar-overlay--visible" : ""
          }`}
          onClick={closeSidebar}
        />

        <PrtsDashboardSidebar isOpen={sidebarOpen} />

        <main className="prts-dashboard-main">
          <PrtsRecentActivity />
        </main>
      </div>
    </div>
  );
}
