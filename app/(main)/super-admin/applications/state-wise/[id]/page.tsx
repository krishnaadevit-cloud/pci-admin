'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Nullable } from 'primereact/ts-helpers';
import { FilterMatchMode } from 'primereact/api';



// Safe JSON importer wrapper that handles environment-specific ES module wrappers and literal JSON key structures
function safeJson(raw: any) {
  if (!raw) return raw;
  if (typeof raw === 'object' && raw.default !== undefined) {
    const keys = Object.keys(raw);
    const hasOtherKeys = keys.some(k => k !== 'default' && k !== '__esModule');
    if (!hasOtherKeys) {
      return raw.default;
    }
  }
  return raw;
}

// Load mock data
import statesDataRaw from '@/jsondata/states.json';
import applicationsListMapRaw from '@/jsondata/applications-list.json';
import stateStatsMapRaw from '@/jsondata/state-stats.json';

const statesData = safeJson(statesDataRaw);
const applicationsListMap = safeJson(applicationsListMapRaw);
const stateStatsMap = safeJson(stateStatsMapRaw);

type AppDataKey = keyof typeof applicationsListMap;
type StateDataKey = keyof typeof stateStatsMap;

const StateApplicationsGrid = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const stateId = (params?.id as string) || 'haryana';
  
  // Resolve data
  const appsList = (applicationsListMap && Array.isArray(applicationsListMap[stateId as AppDataKey]))
    ? applicationsListMap[stateId as AppDataKey]
    : ((applicationsListMap && Array.isArray(applicationsListMap['default']))
      ? applicationsListMap['default']
      : []);

  const stateStats = (stateStatsMap && stateStatsMap[stateId as StateDataKey]) || (stateStatsMap && stateStatsMap['default']);

  const [selectedState, setSelectedState] = useState<string>(stateId);
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>([
    new Date(2024, 4, 1),
    new Date(2024, 4, 20)
  ]);
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filteredApps, setFilteredApps] = useState<any[]>([]);

  // Dialog State
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [detailsVisible, setDetailsVisible] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    setSelectedState(stateId);
  }, [stateId]);

  // Read status query param
  useEffect(() => {
    if (searchParams) {
      const statusParam = searchParams.get('status');
      if (statusParam) {
        setStatusFilter(statusParam.toLowerCase());
      } else {
        setStatusFilter('all');
      }
    }
  }, [searchParams, appsList]);


  useEffect(() => {
    let result = Array.isArray(appsList) ? [...appsList] : [];
    if (statusFilter !== 'all') {
      result = result.filter(app => app && app.status && app.status.toLowerCase() === statusFilter.toLowerCase());
    }
    setFilteredApps(result);
  }, [statusFilter, appsList]);

  const handleStateChange = (e: any) => {
    const val = e.value;
    setSelectedState(val);
    if (val === 'all') {
      router.push('/super-admin/dashboard');
    } else {
      router.push(`/super-admin/applications/state-wise/${val}`);
    }
  };

  // Status values for filter dropdown
  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Approved', value: 'approved' },
    { label: 'Pending', value: 'pending' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Returned', value: 'returned' }
  ];

  // Excel mock export
  const exportExcel = () => {
    import('xlsx').then((xlsx) => {
      const worksheet = xlsx.utils.json_to_sheet(filteredApps);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
      const excelBuffer = xlsx.write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      });
      saveAsExcelFile(excelBuffer, `applications_${stateId}`);
    });
  };

  const saveAsExcelFile = (buffer: any, fileName: string) => {
    import('file-saver').then((module) => {
      if (module && module.default) {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data = new Blob([buffer], {
          type: EXCEL_TYPE
        });
        module.default.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
      }
    });
  };

  // Status badges helpers
  const getStatusSeverity = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  };

  const openAppDetails = (app: any) => {
    setSelectedApp(app);
    setDetailsVisible(true);
  };

  const proceedScrutiny = () => {
    if (selectedApp) {
      toast.current?.show({
        severity: 'success',
        summary: 'Scrutiny Completed',
        detail: `Application ${selectedApp.appNo} status updated to 'Approved' successfully.`,
        life: 3000
      });
      // Dynamically update the application status in local state
      setFilteredApps(prev => prev.map(a => a.appNo === selectedApp.appNo ? { ...a, status: 'Approved' } : a));
    }
    setDetailsVisible(false);
  };

  const closeAppDetails = () => {
    setDetailsVisible(false);
    setSelectedApp(null);
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />
      
      {/* Breadcrumbs */}
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/super-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer" onClick={() => router.push(`/super-admin/state-council/${stateId}`)}>{stateStats.stateName}</span>
        <span>/</span>
        <span className="font-semibold text-700">Fresh Registration Applications</span>
      </div>

      {/* Header & Filter Controls */}
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">Fresh Registration Applications - {stateStats.stateName}</h2>
          <p className="header-subtitle">State Database Registry and Application Scrutiny</p>
        </div>
        
        <div className="flex flex-wrap align-items-center gap-3">
          {/* State selector */}
          <div className="flex flex-column gap-1">
            <span className="text-xs font-semibold text-600">Select Council</span>
            <Dropdown
              value={selectedState}
              options={statesData}
              optionLabel="name"
              optionValue="id"
              onChange={handleStateChange}
              placeholder="Select State"
              className="w-full md:w-15rem"
              filter
              style={{ borderRadius: '8px' }}
            />

          </div>

          {/* Export Button */}
          <div className="flex flex-column gap-1 justify-content-end">
            <span className="text-xs font-semibold text-0 block" style={{ visibility: 'hidden' }}>Export</span>
            <Button
              type="button"
              icon="pi pi-file-excel"
              label="Export"
              severity="success"
              className="p-button-outlined"
              onClick={exportExcel}
              style={{ borderRadius: '8px' }}
            />
          </div>
        </div>
      </div>

      {/* Stats summary row for applications */}
      <div className="grid gap-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #3b82f6', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeftWidth: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Total</span>
          <span className="text-xl font-bold text-900 mt-1 block">
            {stateId === 'haryana' ? '4,520' : appsList.length}
          </span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #f59e0b', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeftWidth: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Pending</span>
          <span className="text-xl font-bold text-amber-600 mt-1 block">
            {stateId === 'haryana' ? '450' : appsList.filter((a: any) => a.status === 'Pending').length}
          </span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #10b981', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeftWidth: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Approved</span>
          <span className="text-xl font-bold text-green-600 mt-1 block">
            {stateId === 'haryana' ? '3,600' : appsList.filter((a: any) => a.status === 'Approved').length}
          </span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #ef4444', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeftWidth: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Rejected</span>
          <span className="text-xl font-bold text-red-600 mt-1 block">
            {stateId === 'haryana' ? '220' : appsList.filter((a: any) => a.status === 'Rejected').length}
          </span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #3b82f6', borderRadius: '8px', border: '1px solid #e2e8f0', borderLeftWidth: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Returned</span>
          <span className="text-xl font-bold text-blue-600 mt-1 block">
            {stateId === 'haryana' ? '250' : appsList.filter((a: any) => a.status === 'Returned').length}
          </span>
        </div>
      </div>

      {/* Main Datatable Card */}
      <div className="dashboard-panel">
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-4">
          <div className="flex flex-wrap gap-2 align-items-center">
            {/* Search Input */}
            <span className="p-input-icon-left w-full md:w-16rem">
              <i className="pi pi-search" />
              <InputText
                value={globalFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setGlobalFilter(val);
                  setFilters({
                    global: { value: val, matchMode: FilterMatchMode.CONTAINS }
                  } as any);
                }}
                placeholder="Search App No., Name, Reg No..."
                className="w-full text-sm"
                style={{ borderRadius: '8px' }}
              />
            </span>

            {/* Status Dropdown */}
            <Dropdown
              value={statusFilter}
              options={statusOptions}
              onChange={(e) => setStatusFilter(e.value)}
              className="w-full md:w-12rem text-sm"
              style={{ borderRadius: '8px' }}
            />
          </div>

          {/* Date range picker */}
          <div className="flex align-items-center gap-2">
            <span className="text-xs text-500 font-semibold uppercase">Filter Date:</span>
            <Calendar
              value={dates}
              onChange={(e) => setDates(e.value as Nullable<(Date | null)[]>)}
              selectionMode="range"
              readOnlyInput
              dateFormat="dd M y"
              className="w-full md:w-15rem text-sm"
              inputStyle={{ borderRadius: '8px' }}
              showIcon
            />
          </div>
        </div>

        <DataTable
          value={filteredApps}
          filters={filters}
          onFilter={(e) => setFilters(e.filters as any)}
          globalFilterFields={['appNo', 'applicantName', 'regNo']}
          paginator
          rows={10}
          className="p-datatable-striped"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
          responsiveLayout="scroll"
        >
          <Column field="appNo" header="Application No." sortable style={{ fontWeight: 600 }} />
          <Column field="applicantName" header="Applicant Name" sortable />
          <Column field="regNo" header="Registration No." sortable />
          <Column field="submittedOn" header="Submitted On" sortable />
          <Column 
            field="status" 
            header="Status" 
            sortable
            body={(row) => (
              <Tag severity={getStatusSeverity(row.status)} value={row.status} />
            )} 
          />
          <Column 
            field="paymentStatus" 
            header="Payment Status" 
            sortable
            body={(row) => (
              <span className={`payment-badge payment-${row.paymentStatus.toLowerCase()}`}>
                {row.paymentStatus}
              </span>
            )}
          />
          <Column 
            header="Action" 
            body={(row) => (
              <Button 
                icon="pi pi-eye" 
                className="p-button-rounded p-button-text p-button-info" 
                onClick={() => openAppDetails(row)}
                tooltip="Inspect Details"
                tooltipOptions={{ position: 'bottom' }}
              />
            )} 
          />
        </DataTable>
      </div>

      {/* Details View Dialog Modal */}
      <Dialog
        header={`Application Inspection details - ${selectedApp?.appNo}`}
        visible={detailsVisible}
        style={{ width: '50vw' }}
        onHide={closeAppDetails}
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Close" icon="pi pi-times" onClick={closeAppDetails} className="p-button-text" />
            <Button label="Proceed with Scrutiny" icon="pi pi-check" onClick={proceedScrutiny} autoFocus />
          </div>
        }
      >
        {selectedApp && (
          <div className="p-fluid grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1rem 0' }}>
            <div>
              <span className="text-xs text-500 font-semibold block">Applicant Name</span>
              <span className="text-sm font-bold text-900 block mt-1">{selectedApp.applicantName}</span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">Registration Number</span>
              <span className="text-sm font-bold text-900 block mt-1">{selectedApp.regNo}</span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">Qualification Degree</span>
              <span className="text-sm font-medium text-800 block mt-1">{selectedApp.qualification}</span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">Affiliated University / Board</span>
              <span className="text-sm font-medium text-800 block mt-1">{selectedApp.university}</span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">Email Address</span>
              <span className="text-sm font-medium text-800 block mt-1">{selectedApp.email}</span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">Phone Number</span>
              <span className="text-sm font-medium text-800 block mt-1">{selectedApp.phone}</span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">Submitted Date</span>
              <span className="text-sm font-medium text-800 block mt-1">{selectedApp.submittedOn}</span>
            </div>
            <div>
              <span className="text-xs text-500 font-semibold block">Payment History</span>
              <span className={`payment-badge payment-${selectedApp.paymentStatus.toLowerCase()} inline-block mt-1`}>
                {selectedApp.paymentStatus}
              </span>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <span className="text-xs text-500 font-semibold block">Application Status</span>
              <Tag severity={getStatusSeverity(selectedApp.status)} value={selectedApp.status} className="mt-1" />
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
};

export default StateApplicationsGrid;
