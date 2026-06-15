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

import circularsDataRaw from '@/jsondata/circulars.json';
const circularsData = safeJson(circularsDataRaw);

const CircularsCenter = () => {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const [circulars, setCirculars] = useState<any[]>(circularsData || []);
  
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [formCirc, setFormCirc] = useState<any>({});

  const categories = ['Academic', 'Administrative', 'Regulatory Compliance', 'IT & E-Governance'];
  const recipients = ['All Pharmacy Institutions', 'State Pharmacy Councils', 'Registered Pharmacists', 'Public Domain'];
  const statuses = ['Published', 'Draft', 'Archived'];

  const openNewCirc = () => {
    setFormCirc({
      id: `CIRC-2024-${100 + circulars.length}`,
      title: '', date: new Date().toISOString().split('T')[0],
      category: 'Administrative', recipient: 'All Pharmacy Institutions', status: 'Draft'
    });
    setDialogVisible(true);
  };

  const saveCirc = () => {
    if (!formCirc.title.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Validation Failed', detail: 'Title is required.', life: 3000 });
      return;
    }
    setCirculars([formCirc, ...circulars]);
    toast.current?.show({ severity: 'success', summary: 'Notice Created', detail: `Circular successfully mapped.`, life: 3000 });
    setDialogVisible(false);
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="font-semibold text-700">Circulars & Notifications</span>
      </div>

      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">Official Notifications Board</h2>
          <p className="header-subtitle">Publish circulars, advisories, and syllabus modifications across councils and institutions</p>
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
              placeholder="Search Subject..."
              className="w-full text-sm py-2"
              style={{ borderRadius: '8px' }}
            />
          </span>
          <Button label="Publish Circular" icon="pi pi-send" className="p-button-sm w-full md:w-auto" style={{ borderRadius: '8px' }} onClick={openNewCirc} />
        </div>

        <DataTable showGridlines value={circulars} filters={filters} onFilter={(e) => setFilters(e.filters as any)} globalFilterFields={['title', 'category']} paginator rows={10} className="p-datatable-striped" responsiveLayout="scroll">
          <Column field="id" header="Circular ID" sortable style={{ fontWeight: 600, width: '120px' }} />
          <Column field="title" header="Subject / Title" sortable />
          <Column field="date" header="Date Issued" sortable style={{ width: '120px' }} />
          <Column field="category" header="Domain" sortable />
          <Column field="recipient" header="Addressed To" />
          <Column 
            field="status" header="Status" sortable 
            body={(row) => <Tag severity={row.status === 'Published' ? 'success' : row.status === 'Draft' ? 'warning' : 'info'} value={row.status} />}
          />
          <Column 
            header="Actions" 
            body={(row) => (
              <div className="flex gap-1">
                <Button icon="pi pi-eye" className="p-button-rounded p-button-text p-button-info p-button-sm" tooltip="View PDF" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger p-button-sm" onClick={() => { setCirculars(circulars.filter(c => c.id !== row.id)); toast.current?.show({severity:'warn', summary:'Deleted', detail:'Circular archived'}) }} tooltip="Delete" tooltipOptions={{ position: 'bottom' }} />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog header="Compose Official Notification" visible={dialogVisible} style={{ width: '500px' }} modal className="p-fluid" footer={<div className="flex justify-content-end gap-2"><Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={() => setDialogVisible(false)} /><Button label="Save & Publish" icon="pi pi-check" onClick={saveCirc} /></div>} onHide={() => setDialogVisible(false)}>
        <div className="flex flex-column gap-3 mt-2">
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">Circular Subject / Title</label>
            <InputText value={formCirc.title} onChange={(e) => setFormCirc({ ...formCirc, title: e.target.value })} />
          </div>
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">Category Domain</label>
            <Dropdown value={formCirc.category} options={categories} onChange={(e) => setFormCirc({ ...formCirc, category: e.value })} />
          </div>
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">Target Recipients</label>
            <Dropdown value={formCirc.recipient} options={recipients} onChange={(e) => setFormCirc({ ...formCirc, recipient: e.value })} />
          </div>
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">Upload PDF Attachment</label>
            <div className="p-3 border-dashed border-2 border-300 border-round text-center surface-50 cursor-pointer">
              <i className="pi pi-cloud-upload text-3xl text-400 mb-2"></i>
              <span className="block text-sm text-600">Click to browse or drag file here</span>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
export default CircularsCenter;
