"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Nullable } from "primereact/ts-helpers";
import { FilterMatchMode } from "primereact/api";
import EmptyTableMessage from "@/components/EmptyTableMessage";

// Safe JSON importer wrapper that handles environment-specific ES module wrappers and literal JSON key structures
function safeJson(raw: any) {
  if (!raw) return raw;
  if (typeof raw === "object" && raw.default !== undefined) {
    const keys = Object.keys(raw);
    const hasOtherKeys = keys.some(
      (k) => k !== "default" && k !== "__esModule",
    );
    if (!hasOtherKeys) {
      return raw.default;
    }
  }
  return raw;
}

// Load mock data
import statesDataRaw from "@/jsondata/states.json";
import applicationsListMapRaw from "@/jsondata/applications-list.json";
import stateStatsMapRaw from "@/jsondata/state-stats.json";

const statesData = safeJson(statesDataRaw);
const applicationsListMap = safeJson(applicationsListMapRaw);
const stateStatsMap = safeJson(stateStatsMapRaw);

type AppDataKey = keyof typeof applicationsListMap;
type StateDataKey = keyof typeof stateStatsMap;

const StateApplicationsGrid = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const stateId = (params?.id as string) || "haryana";

  // Resolve data memoized to prevent reference changes and infinite re-render loops
  const appsList = useMemo(() => {
    if (stateId === "all") {
      return Object.entries(applicationsListMap)
        .filter(([key]) => key !== "default")
        .flatMap(([_, list]) => list);
    } else {
      return applicationsListMap &&
        Array.isArray(applicationsListMap[stateId as AppDataKey])
          ? applicationsListMap[stateId as AppDataKey]
          : applicationsListMap && Array.isArray(applicationsListMap["default"])
          ? applicationsListMap["default"]
          : [];
    }
  }, [stateId]);

  const stateStats =
    stateId === "all"
      ? { stateName: "All India" }
      : (stateStatsMap && stateStatsMap[stateId as StateDataKey]) ||
        (stateStatsMap && stateStatsMap["default"]) || {
          stateName: "State Pharmacy Council",
        };

  const [selectedState, setSelectedState] = useState<string>(stateId);
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>([
    new Date(2024, 4, 1),
    new Date(2024, 4, 25),
  ]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [filteredApps, setFilteredApps] = useState<any[]>([]);

  // Dialog State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    setSelectedState(stateId);
  }, [stateId]);

  const getAppType = (appNo: string) => {
    const APP_TYPES = [
      "Fresh Registration",
      "Renewal",
      "Additional Qualification",
      "Duplicate Certificate",
      "Migration",
      "NOC",
      "Good Standing Certificate",
      "Name Change",
      "Address Change",
      "Restoration",
      "Others",
    ];
    let hash = 0;
    for (let i = 0; i < appNo.length; i++) {
      hash = appNo.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % APP_TYPES.length;
    return APP_TYPES[index];
  };

  // Read status and type query param (only execute when searchParams changes)
  useEffect(() => {
    if (searchParams) {
      const statusParam = searchParams.get("status");
      if (statusParam) {
        setStatusFilter(statusParam.toLowerCase());
      } else {
        setStatusFilter("all");
      }

      const typeParam = searchParams.get("type");
      if (typeParam) {
        setTypeFilter(typeParam.toLowerCase());
      } else {
        setTypeFilter("all");
      }
    }
  }, [searchParams]);

  useEffect(() => {
    let result = Array.isArray(appsList) ? [...appsList] : [];

    // Process application type deterministically
    result = result.map((app: any) => ({
      ...app,
      appType: app.appType || getAppType(app.appNo),
    }));

    if (statusFilter !== "all") {
      result = result.filter(
        (app) =>
          app &&
          app.status &&
          app.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (app) =>
          app &&
          app.appType &&
          app.appType.toLowerCase() === typeFilter.toLowerCase(),
      );
    }

    // Filter by dates
    if (dates && dates[0]) {
      const startDate = dates[0];
      const endDate = dates[1] || dates[0];
      
      const startMs = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
      const endMs = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).getTime();

      result = result.filter((app) => {
        if (!app.submittedOn) return false;
        const appDate = new Date(app.submittedOn);
        const appMs = appDate.getTime();
        return appMs >= startMs && appMs <= endMs;
      });
    }

    setFilteredApps(result);
  }, [statusFilter, typeFilter, dates, appsList]);

  const handleStateChange = (e: any) => {
    const val = e.value;
    setSelectedState(val);
    if (val === "all") {
      router.push("/pci-admin/applications/state-wise/all");
    } else {
      router.push(`/pci-admin/applications/state-wise/${val}`);
    }
  };

  // Status values for filter dropdown
  const statusOptions = [
    { label: "All Statuses", value: "all" },
    { label: "Approved", value: "approved" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
    { label: "Returned", value: "returned" },
  ];

  // Excel mock export
  const exportExcel = () => {
    import("xlsx").then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(filteredApps);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      saveAsExcelFile(excelBuffer, `applications_${stateId}`);
    });
  };

  const saveAsExcelFile = (buffer: any, fileName: string) => {
    import("file-saver").then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        let EXCEL_EXTENSION = ".xlsx";
        const data = new Blob([buffer], {
          type: EXCEL_TYPE,
        });
        module.default.saveAs(
          data,
          fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION,
        );
      }
    });
  };

  // Status badges helpers
  const getStatusSeverity = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "info";
    }
  };

  const openAppDetails = (app: any) => {
    setSelectedApp(app);
    setDetailsVisible(true);
  };

  const proceedScrutiny = () => {
    if (selectedApp) {
      toast.current?.show({
        severity: "success",
        summary: "Scrutiny Completed",
        detail: `Application ${selectedApp.appNo} status updated to 'Approved' successfully.`,
        life: 3000,
      });
      // Dynamically update the application status in local state
      setFilteredApps((prev) =>
        prev.map((a) =>
          a.appNo === selectedApp.appNo ? { ...a, status: "Approved" } : a,
        ),
      );
    }
    setDetailsVisible(false);
  };

  const closeAppDetails = () => {
    setDetailsVisible(false);
    setSelectedApp(null);
  };

  const summaryCards = useMemo(() => [
    { id: "all", title: "Total Applications", value: appsList.length, color: "blue", icon: "pi pi-file", subText: "Total applications received" },
    { id: "pending", title: "Pending Scrutiny", value: appsList.filter((a: any) => a.status === "Pending").length, color: "orange", icon: "pi pi-clock", subText: "Pending verification" },
    { id: "approved", title: "Approved Registry", value: appsList.filter((a: any) => a.status === "Approved").length, color: "green", icon: "pi pi-check-circle", subText: "Successfully approved" },
    { id: "rejected", title: "Rejected Applications", value: appsList.filter((a: any) => a.status === "Rejected").length, color: "red", icon: "pi pi-times-circle", subText: "Rejected applications" },
    { id: "returned", title: "Returned Applications", value: appsList.filter((a: any) => a.status === "Returned").length, color: "cyan", icon: "pi pi-reply", subText: "Returned for correction" },
  ], [appsList]);

  const getPageTitle = () => {
    if (typeFilter !== "all") {
      return `${typeFilter
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")} Applications`;
    }
    return "Registration Applications";
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />

      {/* Breadcrumbs */}
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span
          className="hover:underline cursor-pointer"
          onClick={() => router.push("/pci-admin/dashboard")}
        >
          National Dashboard
        </span>
        <span>/</span>
        <span
          className="hover:underline cursor-pointer"
          onClick={() =>
            router.push(
              stateId === "all"
                ? "/pci-admin/dashboard"
                : `/pci-admin/state-council/${stateId}`,
            )
          }
        >
          {stateStats.stateName}
        </span>
        <span>/</span>
        <span className="font-semibold text-700">{getPageTitle()}</span>
      </div>

      <div className="fal-page-header">
        <div className="fal-page-header__inner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="fal-page-header__icon-wrap">
              <i className="pi pi-file-edit" />
            </div>
            <div className="fal-page-header__text">
              <h1 className="fal-page-header__title">
                {getPageTitle()} - {stateStats.stateName}
              </h1>
              <p className="fal-page-header__subtitle">
                State Database Registry and Application Scrutiny
              </p>
            </div>
          </div>
          <div className="fal-page-header__meta">
            <span className="fal-page-header__badge">
              <i className="pi pi-list" />
              {filteredApps.length} Total
            </span>
          </div>
        </div>
      </div>

      {/* Stats summary row for applications */}
      <div
        className="grid gap-3 mb-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}
      >
        {summaryCards.map((card) => (
          <div
            key={card.id}
            className={`stats-card card-${card.color} p-3`}
            onClick={() => setStatusFilter(card.id)}
          >
            <div className="flex justify-content-between align-items-center">
              <div>
                <span className="text-sm font-semibold text-600 block mb-1">
                  {card.title}
                </span>
                <h2 className="text-3xl font-bold text-900 m-0">
                  {card.value}
                </h2>
                <span className="text-xs text-primary font-medium hover:underline block mt-2 cursor-pointer">
                  {card.subText} →
                </span>
              </div>
              <div className={`card-icon ${card.color}`}>
                <i className={card.icon} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Datatable Card */}
      <div className="dashboard-panel">
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-4">
          <div className="flex  gap-2 align-items-center">
            {/* Search Input */}
            <span className="p-input-icon-left w-full md:w-16rem">
              <i className="pi pi-search" />
              <InputText
                value={globalFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setGlobalFilter(val);
                  setFilters({
                    global: { value: val, matchMode: FilterMatchMode.CONTAINS },
                  } as any);
                }}
                placeholder="Search App No., Name, Reg No..."
                className="w-full text-sm"
                style={{ borderRadius: "8px" }}
              />
            </span>

            {/* Status Dropdown */}
            <Dropdown
              value={statusFilter}
              options={statusOptions}
              onChange={(e) => setStatusFilter(e.value)}
              className="w-full md:w-11rem text-sm"
              style={{ borderRadius: "8px" }}
            />

            {/* Application Type Dropdown */}
            <Dropdown
              value={typeFilter}
              options={[
                { label: "Application Types", value: "all" },
                { label: "Fresh Registration", value: "fresh registration" },
                { label: "Renewal", value: "renewal" },
                {
                  label: "Additional Qualification",
                  value: "additional qualification",
                },
                {
                  label: "Duplicate Certificate",
                  value: "duplicate certificate",
                },
                { label: "Migration", value: "migration" },
                { label: "NOC", value: "noc" },
                {
                  label: "Good Standing Certificate",
                  value: "good standing certificate",
                },
                { label: "Name Change", value: "name change" },
                { label: "Address Change", value: "address change" },
                { label: "Restoration", value: "restoration" },
                { label: "Others", value: "others" },
              ]}
              onChange={(e) => setTypeFilter(e.value)}
              className="w-full md:w-15rem text-sm"
              style={{ borderRadius: "8px" }}
              filter
            />
          </div>

          {/* Date range picker */}
          <div className="flex align-items-center gap-2">
            <span className="text-xs text-500 font-semibold uppercase">
              Filter Date:
            </span>
            <Calendar
              value={dates}
              onChange={(e) => setDates(e.value as Nullable<(Date | null)[]>)}
              selectionMode="range"
              readOnlyInput
              dateFormat="dd M y"
              className="w-full md:w-15rem text-sm"
              inputStyle={{ borderRadius: "8px" }}
              showIcon
            />
          </div>
        </div>

        <DataTable
          showGridlines
          value={filteredApps}
          filters={filters}
          onFilter={(e) => setFilters(e.filters as any)}
          globalFilterFields={["appNo", "applicantName", "regNo"]}
          paginator
          rows={10}
          emptyMessage={<EmptyTableMessage message="No pharmacy registration applications found." />}
          className="p-datatable-striped"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          responsiveLayout="scroll"
        >
          <Column
            field="appNo"
            header="Application No."
            sortable
            style={{ fontWeight: 600 }}
          />
          <Column field="applicantName" header="Applicant Name" sortable />
          <Column field="appType" header="Application Type" sortable />
          <Column field="regNo" header="Registration No." sortable />
          <Column field="submittedOn" header="Submitted On" sortable />
          <Column
            field="status"
            header="Status"
            sortable
            body={(row) => {
              const statusLower = row.status.toLowerCase();
              const statusClass = 
                statusLower === "approved" ? "fal-status--approved" :
                statusLower === "pending" ? "fal-status--pending" :
                statusLower === "rejected" ? "fal-status--rejected" :
                "fal-status--in_review";
              return (
                <span className={`fal-status ${statusClass}`}>
                  {row.status}
                </span>
              );
            }}
          />
          <Column
            field="paymentStatus"
            header="Payment Status"
            sortable
            body={(row) => (
              <span
                className={`payment-badge payment-${row.paymentStatus.toLowerCase()}`}
              >
                {row.paymentStatus}
              </span>
            )}
          />
          <Column
            header="Action"
            body={(row) => (
              <Button
                icon="pi pi-eye"
                className="fal-action-btn"
                onClick={() => openAppDetails(row)}
                tooltip="Inspect Details"
                tooltipOptions={{ position: "bottom" }}
              />
            )}
          />
        </DataTable>
      </div>

      {/* Details View Dialog Modal */}
      <Dialog
        header={`Application Inspection details - ${selectedApp?.appNo}`}
        visible={detailsVisible}
        style={{ width: "50vw" }}
        onHide={closeAppDetails}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Close"
              icon="pi pi-times"
              onClick={closeAppDetails}
              className="p-button-text"
            />
            <Button
              label="Proceed with Scrutiny"
              icon="pi pi-check"
              onClick={proceedScrutiny}
              autoFocus
            />
          </div>
        }
      >
        {selectedApp && (
          <div
            className="p-fluid grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.25rem",
              padding: "1rem 0",
            }}
          >
            <div>
              <span className="text-xs text-500 font-semibold block">
                Applicant Name
              </span>
              <span className="text-sm font-bold text-900 block mt-1">
                {selectedApp.applicantName}
              </span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">
                Registration Number
              </span>
              <span className="text-sm font-bold text-900 block mt-1">
                {selectedApp.regNo}
              </span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">
                Qualification Degree
              </span>
              <span className="text-sm font-medium text-800 block mt-1">
                {selectedApp.qualification}
              </span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">
                Affiliated University / Board
              </span>
              <span className="text-sm font-medium text-800 block mt-1">
                {selectedApp.university}
              </span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">
                Email Address
              </span>
              <span className="text-sm font-medium text-800 block mt-1">
                {selectedApp.email}
              </span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">
                Phone Number
              </span>
              <span className="text-sm font-medium text-800 block mt-1">
                {selectedApp.phone}
              </span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">
                Submitted Date
              </span>
              <span className="text-sm font-medium text-800 block mt-1">
                {selectedApp.submittedOn}
              </span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">
                Payment History
              </span>
              <span
                className={`payment-badge payment-${selectedApp.paymentStatus.toLowerCase()} inline-block mt-1`}
              >
                {selectedApp.paymentStatus}
              </span>
            </div>
            <div style={{ gridColumn: "span 2" }}>
              <span className="text-xs text-500 font-semibold block">
                Application Status
              </span>
              <span className={`fal-status mt-1 inline-block ${
                selectedApp.status.toLowerCase() === "approved" ? "fal-status--approved" :
                selectedApp.status.toLowerCase() === "pending" ? "fal-status--pending" :
                selectedApp.status.toLowerCase() === "rejected" ? "fal-status--rejected" :
                "fal-status--in_review"
              }`}>
                {selectedApp.status}
              </span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

import { Suspense } from "react";

const StateApplicationsGridPage = () => {
  return (
    <Suspense
      fallback={
        <div className="card p-5 text-center">
          <i className="pi pi-spin pi-spinner text-3xl text-primary mb-2 block"></i>
          <span>Loading Applications...</span>
        </div>
      }
    >
      <StateApplicationsGrid />
    </Suspense>
  );
};

export default StateApplicationsGridPage;
