"use client";

import { useEffect, useRef, useState } from "react";
import { Toast } from "primereact/toast";
import PrtsDashboardSidebar from "./PrtsDashboardSidebar";
import PrtsServiceCard from "./PrtsServiceCard";
import PrtsRecentActivity from "./PrtsRecentActivity";
import { useDashboardSidebar } from "../DashboardSidebarContext";
import { useAuth } from "../AuthProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchDashboardData,
  fetchApplicationTypesData,
  selectDashboardData,
  selectFreshRegistrationLoading,
} from "@/store/slices";
import type { ApplicationStatus } from "@/types/dashboard";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function ServiceCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`prts-service-card prts-service-card--skeleton ${compact ? "prts-service-card--compact" : ""}`}
      aria-hidden="true"
    >
      <div className="prts-skeleton prts-skeleton--icon" />
      <div className="prts-skeleton prts-skeleton--title" />
      <div className="prts-skeleton prts-skeleton--desc" />
      <div className="prts-skeleton prts-skeleton--desc prts-skeleton--desc-short" />
    </div>
  );
}

type ServiceCard = {
  title: string;
  description: string;
  icon: string;
  href?: string;
  disabled: boolean;
  statusKey: keyof ApplicationStatus | null;
};

const SERVICE_SECTIONS: { title: string; cards: ServiceCard[] }[] = [
  {
    title: "New Registration services",
    cards: [
      {
        title: "Fresh Registration",
        description: "New medical registration",
        icon: "/assets/dashboard/fresh_registration.svg",
        href: "/pharmacy/fresh-registration",
        disabled: false,
        statusKey: "fresh_status",
      },
      {
        title: "Fresh Registration - Other State",
        description: "Registration for practitioners from other states",
        icon: "/assets/dashboard/fresh_registration_other_state.svg",
        href: "/pharmacy/fresh-registration-other-state",
        disabled: false,
        statusKey: "fresh_status",
      },
      {
        title: "Transfer in",
        description: "Transfer registration from another state to Gujarat",
        icon: "/assets/dashboard/transfer_in.svg",
        disabled: true,
        statusKey: null,
      },
    ],
  },
  {
    title: "Renewal & Re-entry services",
    cards: [
      {
        title: "Renewal Registration",
        description: "Renew your existing medical registration",
        href: "/pharmacy/renewal",
        icon: "/assets/dashboard/renewal_registration.svg",
        disabled: false,
        statusKey: "renewal_status",
      },
      {
        title: "Re-Entry Registration",
        description: "Re-register after a lapse or cancellation",
        href: "/pharmacy/re-entry",
        icon: "/assets/dashboard/re_entry_registration.svg",
        disabled: false,
        statusKey: "reentry_status",
      },
    ],
  },
  {
    title: "Qualifications & Eligibility",
    cards: [
      {
        title: "Add Qualification",
        description: "Add a new degree or diploma to your profile",
        href: "/pharmacy/add-qualification",
        icon: "/assets/dashboard/add_qualification.svg",
        disabled: false,
        statusKey: "degree_add_status",
      },
      {
        title: "Eligibility — Other State",
        description: "Eligibility certificate for another state application",
        icon: "/assets/dashboard/eligibility_other_state.svg",
        disabled: true,
        statusKey: null,
      },
      {
        title: "Eligibility — Other Country",
        description: "International eligibility certification",
        icon: "/assets/dashboard/eligibility_other_country.svg",
        disabled: true,
        statusKey: null,
      },
    ],
  },
  {
    title: "Certificates & Updates",
    cards: [
      {
        title: "Good Standing Certificate",
        description: "Request a certificate of good professional standing",
        href: "/pharmacy/good-standing-certificate",
        icon: "/assets/dashboard/good_standing_certificate.svg",
        disabled: false,
        statusKey: "good_standing_status",
      },
      {
        title: "Change in Name",
        description: "Update registered name on your record",
        href: "/pharmacy/change-name",
        icon: "/assets/dashboard/change_in_name.svg",
        disabled: false,
        statusKey: "name_change_status",
      },
      {
        title: "Change in Address",
        description: "Update your registered correspondence address",
        href: "/pharmacy/change-address",
        icon: "/assets/dashboard/change_in_address.svg",
        disabled: false,
        statusKey: "address_change_status",
      },
      {
        title: "Duplicate Certificate",
        description: "Request a duplicate of your registration certificate",
        href: "/pharmacy/duplicate-certificate",
        icon: "/assets/dashboard/duplicate_certificate.svg",
        disabled: false,
        statusKey: "duplicate_certi_status",
      },
    ],
  },
];

export default function PrtsDashboard() {
  const sidebar = useDashboardSidebar();
  const sidebarOpen = sidebar?.isOpen ?? false;
  const closeSidebar = () => sidebar?.setIsOpen(false);

  const { user } = useAuth();
  const displayName = user?.fullName ?? "User";

  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const isLoading = useAppSelector(selectFreshRegistrationLoading);
  const [hasFetched, setHasFetched] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    dispatch(fetchApplicationTypesData()).unwrap().catch((err: unknown) => {
      const message = (err as { message?: string })?.message ?? "Failed to load application types. Please try again.";
      toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
    });
    dispatch(fetchDashboardData()).unwrap()
      .then(() => setHasFetched(true))
      .catch((err: unknown) => {
        setHasFetched(true);
        const message = (err as { message?: string })?.message ?? "Failed to load dashboard data. Please try again.";
        toast.current?.show({ severity: "error", summary: "Error", detail: message, life: 5000 });
      });
  }, [dispatch]);

  const showSkeleton = !hasFetched || isLoading;

  return (
    <div className="prts-pharmacy-dashboard prts-pharmacy-scope">
      <Toast ref={toast} position="top-right" appendTo={document.body} />
      <div className="prts-dashboard-wrapper">
        <div
          className={`prts-sidebar-overlay ${
            sidebarOpen ? "prts-sidebar-overlay--visible" : ""
          }`}
          onClick={closeSidebar}
          role="presentation"
          aria-hidden={!sidebarOpen}
        />

        <PrtsDashboardSidebar isOpen={sidebarOpen} />

        <main className="prts-dashboard-main">
          <div className="prts-dashboard-greeting">
            <h1>{getGreeting()}, {displayName} 👋</h1>
            <p className="prts-dashboard-greeting__subtitle">
              Your registration is active and up to date. Select a service below
              to proceed.
            </p>
          </div>

          {SERVICE_SECTIONS.map((section, sectionIndex) => (
            <section key={section.title} className="prts-service-section">
              <h2 className="prts-service-section__title">{section.title}</h2>
              <div className="prts-service-section__grid">
                {section.cards.map((card) =>
                  showSkeleton ? (
                    <ServiceCardSkeleton key={card.title} compact={sectionIndex !== 0} />
                  ) : (
                    <PrtsServiceCard
                      key={card.title}
                      {...card}
                      disabled={
                        card.statusKey
                          ? dashboardData?.application_status?.[card.statusKey] !== true
                          : card.disabled
                      }
                      compact={sectionIndex !== 0}
                    />
                  )
                )}
              </div>
            </section>
          ))}

          <PrtsRecentActivity limit={3} showViewAll />
        </main>
      </div>
    </div>
  );
}
