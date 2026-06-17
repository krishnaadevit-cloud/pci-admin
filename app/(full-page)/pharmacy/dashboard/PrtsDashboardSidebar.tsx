"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { useDashboardSidebar } from "../DashboardSidebarContext";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/pharmacy/dashboard",
    icon: "/assets/dashboard/dashboard.svg",
  },
  {
    label: "Applications",
    href: "/pharmacy/applications",
    icon: "/assets/dashboard/application.svg",
    badge: 5,
  },
  {
    label: "Smart Card",
    href: "/pharmacy/smart-card",
    icon: "/assets/dashboard/smart_card.svg",
  },
  {
    label: "Fee Payments",
    href: "/pharmacy/fee-payments",
    icon: "/assets/dashboard/fee_payment.svg",
  },
  {
    label: "Certificates",
    href: "/pharmacy/certificates",
    icon: "/assets/dashboard/certificate.svg",
  },
];

const SUPPORT_ITEMS = [
  { label: "Appeal", href: "#", icon: "/assets/dashboard/appeal.svg" },
  { label: "Contact us", href: "#", icon: "/assets/dashboard/contact_us.svg" },
];

interface SidebarProps {
  isOpen: boolean;
}

export default function PrtsDashboardSidebar({ isOpen }: SidebarProps) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const dashboardSidebar = useDashboardSidebar();
  const isFreshRegistration = pathname.startsWith("/pharmacy/fresh-registration");

  const closeSidebar = () => dashboardSidebar?.setIsOpen(false);

  const handleLogout = () => {
    closeSidebar();
    logout();
  };

  const logoutControl = (
    <>
      <hr className="prts-dashboard-sidebar__divider" />
      <button
        type="button"
        className="prts-dashboard-sidebar__logout-btn"
        onClick={handleLogout}
      >
        <div className="prts-dashboard-sidebar__logout-icon-wrapper">
          <Image
            src="/assets/dashboard/logout.svg"
            alt=""
            width={32}
            height={32}
            aria-hidden
          />
        </div>
        <span>Log out</span>
      </button>
    </>
  );

  useEffect(() => {
    if (!isOpen) return;

    const mq = window.matchMedia("(max-width: 1024px)");
    if (!mq.matches && !isFreshRegistration) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isFreshRegistration]);

  return (
    <aside className={`prts-dashboard-sidebar ${isOpen ? "prts-dashboard-sidebar--open" : ""}`}>
      <div className="prts-dashboard-sidebar__header">
        {/* <button
          type="button"
          className="prts-dashboard-sidebar__close"
          onClick={closeSidebar}
          aria-label="Close navigation menu"
        >
          <span aria-hidden>✕</span>
        </button> */}
      </div>

      <div className="prts-dashboard-sidebar__body">
        <nav className="prts-dashboard-sidebar__nav">
          <p className="prts-dashboard-sidebar__section">Navigation</p>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`prts-dashboard-sidebar__link ${
                    pathname === item.href
                      ? "prts-dashboard-sidebar__link--active"
                      : ""
                  }`}
                  onClick={closeSidebar}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="prts-dashboard-sidebar__icon"
                    aria-hidden
                  />
                  <span>{item.label}</span>
                  {item.badge != null && (
                    <span className="prts-dashboard-sidebar__badge">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <p className="prts-dashboard-sidebar__section">Support</p>
          <ul>
            {SUPPORT_ITEMS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="prts-dashboard-sidebar__link"
                  onClick={closeSidebar}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={20}
                    height={20}
                    className="prts-dashboard-sidebar__icon"
                    aria-hidden
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="prts-dashboard-sidebar__footer prts-dashboard-sidebar__footer--inline">
            {logoutControl}
          </div>
        </nav>
      </div>
    </aside>
  );
}
