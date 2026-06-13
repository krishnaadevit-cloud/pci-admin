'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';

function safeJson(raw: any) {
  if (!raw) return raw;
  if (typeof raw === 'object' && raw.default !== undefined) {
    const keys = Object.keys(raw);
    const hasOtherKeys = keys.some(k => k !== 'default' && k !== '__esModule');
    if (!hasOtherKeys) return raw.default;
  }
  return raw;
}

import grievancesDataRaw from '@/jsondata/grievances.json';
const grievancesData = safeJson(grievancesDataRaw);

const GrievanceSupport = () => {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const [tickets, setTickets] = useState<any[]>(grievancesData || []);
  
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];

  const inspectTicket = (ticket: any) => {
    setSelectedTicket({ ...ticket });
    setDialogVisible(true);
  };

  const saveStatus = () => {
    if (selectedTicket) {
      setTickets(tickets.map(t => t.id === selectedTicket.id ? selectedTicket : t));
      toast.current?.show({ severity: 'success', summary: 'Status Updated', detail: `Ticket ${selectedTicket.id} status modified.`, life: 3000 });
      setDialogVisible(false);
    }
  };

  const getPrioritySeverity = (priority: string) => {
    switch(priority) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'info';
      default: return 'success';
    }
  };

  const getStatusSeverity = (status: string) => {
    switch(status) {
      case 'Resolved': return 'success';
      case 'Closed': return 'success';
      case 'In Progress': return 'info';
      default: return 'warning';
    }
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/super-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="font-semibold text-700">Grievance Support Desk</span>
      </div>

      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">IT Grievances & Support Desk</h2>
          <p className="header-subtitle">Resolve helpdesk tickets raised by pharmacists, colleges, and council admins</p>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-4">
          <span className="p-input-icon-left w-full md:w-16rem">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={(e) => {
                const val = e.target.value;
                setGlobalFilter(val);
                setFilters({ global: { value: val, matchMode: FilterMatchMode.CONTAINS } } as any);
              }}
              placeholder="Search Ticket ID, Name..."
              className="w-full text-sm py-2"
              style={{ borderRadius: '8px' }}
            />
          </span>
        </div>

        <DataTable value={tickets} filters={filters} onFilter={(e) => setFilters(e.filters as any)} globalFilterFields={['id', 'applicantName', 'category', 'state']} paginator rows={10} className="p-datatable-striped" responsiveLayout="scroll">
          <Column field="id" header="Ticket ID" sortable style={{ fontWeight: 600 }} />
          <Column field="applicantName" header="Raised By" sortable />
          <Column field="userType" header="User Type" />
          <Column field="state" header="State / UT" sortable />
          <Column field="category" header="Issue Category" />
          <Column 
            field="priority" header="Priority" sortable 
            body={(row) => <Tag severity={getPrioritySeverity(row.priority)} value={row.priority} />}
          />
          <Column 
            field="status" header="Status" sortable 
            body={(row) => <Tag severity={getStatusSeverity(row.status)} value={row.status} />}
          />
          <Column 
            header="Actions" 
            body={(row) => (
              <Button icon="pi pi-pencil" label="Resolve" className="p-button-outlined p-button-sm" onClick={() => inspectTicket(row)} />
            )}
          />
        </DataTable>
      </div>

      <Dialog header={`Inspect Ticket - ${selectedTicket?.id}`} visible={dialogVisible} style={{ width: '500px' }} modal className="p-fluid" footer={<div className="flex justify-content-end gap-2"><Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDialogVisible(false)} /><Button label="Update Status" icon="pi pi-check" onClick={saveStatus} /></div>} onHide={() => setDialogVisible(false)}>
        {selectedTicket && (
          <div className="flex flex-column gap-3 mt-2">
            <div className="flex flex-column gap-1">
              <span className="text-xs text-500 font-semibold block">Applicant Name / Entity</span>
              <span className="text-sm font-bold text-900 block mt-1">{selectedTicket.applicantName} ({selectedTicket.userType})</span>
            </div>
            <div className="flex flex-column gap-1">
              <span className="text-xs text-500 font-semibold block">Issue Category</span>
              <span className="text-sm font-medium text-800 block mt-1">{selectedTicket.category}</span>
            </div>
            <div className="flex flex-column gap-1 p-3 surface-50 border-round">
              <span className="text-xs text-500 font-semibold block mb-2">Detailed Description</span>
              <p className="text-sm text-800 m-0 line-height-3">{selectedTicket.description}</p>
            </div>
            <div className="flex flex-column gap-1 mt-2">
              <label className="text-xs font-semibold text-600">Update Resolution Status</label>
              <Dropdown value={selectedTicket.status} options={statuses} onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.value })} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
export default GrievanceSupport;
