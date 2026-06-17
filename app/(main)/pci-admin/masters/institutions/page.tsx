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
import EmptyTableMessage from "@/components/EmptyTableMessage";

function safeJson(raw: any) {
  if (!raw) return raw;
  if (typeof raw === 'object' && raw.default !== undefined) {
    const keys = Object.keys(raw);
    const hasOtherKeys = keys.some(k => k !== 'default' && k !== '__esModule');
    if (!hasOtherKeys) return raw.default;
  }
  return raw;
}

import institutionsDataRaw from '@/jsondata/institutions.json';
const institutionsData = safeJson(institutionsDataRaw);

const InstitutionsMaster = () => {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const [institutions, setInstitutions] = useState<any[]>(institutionsData || []);
  
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [formInst, setFormInst] = useState<any>({});

  const types = ['Government', 'Govt-Aided', 'Private', 'Deemed University'];
  const statuses = ['Approved', 'Pending Renewal', 'Notice Issued', 'Suspended'];

  const openNewInst = () => {
    setDialogMode('add');
    setFormInst({
      id: `COL-00${institutions.length + 1}`,
      name: '', state: '', type: 'Private', courses: 'B.Pharm',
      pciCode: '', approvalStatus: 'Approved', intakeCapacity: 60,
      lastInspection: '', validUpto: ''
    });
    setDialogVisible(true);
  };

  const editInst = (inst: any) => {
    setDialogMode('edit');
    setFormInst({ ...inst });
    setDialogVisible(true);
  };

  const saveInst = () => {
    if (!formInst.name.trim() || !formInst.state.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Validation Failed', detail: 'Please fill in required fields.', life: 3000 });
      return;
    }

    if (dialogMode === 'add') {
      setInstitutions([formInst, ...institutions]);
      toast.current?.show({ severity: 'success', summary: 'Institution Added', detail: `${formInst.name} added to the registry.`, life: 3000 });
    } else {
      setInstitutions(institutions.map(i => i.id === formInst.id ? formInst : i));
      toast.current?.show({ severity: 'info', summary: 'Institution Updated', detail: `${formInst.name} details updated.`, life: 3000 });
    }
    setDialogVisible(false);
  };

  const getStatusSeverity = (status: string) => {
    switch(status) {
      case 'Approved': return 'success';
      case 'Pending Renewal': return 'warning';
      case 'Notice Issued': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Masters</span>
        <span>/</span>
        <span className="font-semibold text-700">Institutions & Colleges Registry</span>
      </div>

      <div className="fal-page-header">
        <div className="fal-page-header__inner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="fal-page-header__icon-wrap">
              <i className="pi pi-building" />
            </div>
            <div className="fal-page-header__text">
              <h1 className="fal-page-header__title">Institutions & Colleges Registry</h1>
              <p className="fal-page-header__subtitle">Manage approved pharmacy colleges, track intake capacity, and schedule PCI inspections</p>
            </div>
          </div>
          <div className="fal-page-header__meta">
            <span className="fal-page-header__badge">
              <i className="pi pi-list" />
              {institutions.length} Total
            </span>
          </div>
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
              placeholder="Search College, State..."
              className="w-full text-sm py-2"
              style={{ borderRadius: '8px' }}
            />
          </span>
          <Button label="Add Institution" icon="pi pi-plus" className="p-button-sm w-full md:w-auto" style={{ borderRadius: '8px' }} onClick={openNewInst} />
        </div>

        <DataTable
          value={institutions}
          filters={filters}
          showGridlines 
          onFilter={(e) => setFilters(e.filters as any)}
          globalFilterFields={['name', 'state', 'pciCode', 'type']}
          paginator rows={10} 
          className="p-datatable-striped" 
          emptyMessage={<EmptyTableMessage message="No institutions found matching the selection." />}
          responsiveLayout="scroll"
        >
          <Column field="pciCode" header="PCI Code" sortable style={{ fontWeight: 600 }} />
          <Column field="name" header="Institution Name" sortable style={{ width: '25%' }} />
          <Column field="state" header="State" sortable />
          <Column field="courses" header="Approved Courses" />
          <Column field="intakeCapacity" header="Intake" sortable />
          <Column 
            field="approvalStatus" header="Status" sortable 
            body={(row) => {
              const statusLower = row.approvalStatus.toLowerCase();
              const statusClass = 
                statusLower === "approved" ? "fal-status--approved" :
                statusLower === "pending renewal" ? "fal-status--pending" :
                "fal-status--rejected";
              return (
                <span className={`fal-status ${statusClass}`}>
                  {row.approvalStatus}
                </span>
              );
            }}
          />
          <Column 
            header="Actions" 
            body={(row) => (
              <div className="flex gap-2 justify-content-center">
                <Button icon="pi pi-pencil" className="fal-action-btn" onClick={() => editInst(row)} tooltip="Edit Details" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-calendar-plus" className="fal-action-btn" onClick={() => toast.current?.show({severity:'success', summary:'Inspection Scheduled', detail:`Notification sent to ${row.name}`})} tooltip="Schedule Inspection" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-trash" className="fal-action-btn" style={{ color: '#ef4444' }} onClick={() => { setInstitutions(institutions.filter(i => i.id !== row.id)); toast.current?.show({severity:'warn', summary:'Deleted', detail:'Institution removed'}) }} tooltip="Remove" tooltipOptions={{ position: 'bottom' }} />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog header={dialogMode === 'add' ? 'Register New Institution' : 'Edit Institution Details'} visible={dialogVisible} style={{ width: '500px' }} modal className="p-fluid" footer={<div className="flex justify-content-end gap-2"><Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDialogVisible(false)} /><Button label="Save Changes" icon="pi pi-check" onClick={saveInst} /></div>} onHide={() => setDialogVisible(false)}>
        <div className="flex flex-column gap-3 mt-2">
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">Institution Name</label>
            <InputText value={formInst.name} onChange={(e) => setFormInst({ ...formInst, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="flex flex-column gap-1">
              <label className="text-xs font-semibold text-600">PCI Code</label>
              <InputText value={formInst.pciCode} onChange={(e) => setFormInst({ ...formInst, pciCode: e.target.value })} />
            </div>
            <div className="flex flex-column gap-1">
              <label className="text-xs font-semibold text-600">State / UT</label>
              <InputText value={formInst.state} onChange={(e) => setFormInst({ ...formInst, state: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">Approved Courses</label>
            <InputText value={formInst.courses} onChange={(e) => setFormInst({ ...formInst, courses: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="flex flex-column gap-1">
              <label className="text-xs font-semibold text-600">Institution Type</label>
              <Dropdown value={formInst.type} options={types} onChange={(e) => setFormInst({ ...formInst, type: e.value })} />
            </div>
            <div className="flex flex-column gap-1">
              <label className="text-xs font-semibold text-600">Approval Status</label>
              <Dropdown value={formInst.approvalStatus} options={statuses} onChange={(e) => setFormInst({ ...formInst, approvalStatus: e.value })} />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
export default InstitutionsMaster;
