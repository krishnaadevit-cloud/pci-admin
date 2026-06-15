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

interface ApplicationMap {
  id: number;
  appType: string;
  docRequired: string;
  mandatory: string;
  totalDocs: number;
}

const ApplicationMapping = () => {
  const router = useRouter();
  const toast = useRef<Toast>(null);
  
  // Search and Filter states
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGlobalFilter(val);
    setFilters(prev => ({
      ...prev,
      global: { ...prev.global, value: val }
    }));
  };

  // State-managed table data
  const [mappings, setMappings] = useState<ApplicationMap[]>([
    { id: 1, appType: 'Fresh Registration', docRequired: 'Identity Proof, Class X (DOB), Diploma/Degree Certificate, All Years Marksheets, Practical Training (500h), Photograph, Signature Scan', mandatory: 'All mandatory', totalDocs: 7 },
    { id: 2, appType: 'Renewal of Registration', docRequired: 'Identity Proof, Original Registration Certificate, Passport Photograph, Scan of Signature, Affidavit of Non-Employment', mandatory: 'All mandatory', totalDocs: 5 },
    { id: 3, appType: 'Additional Qualification', docRequired: 'Identity Proof, Current Registration Certificate, PG Degree/Diploma Certificate, PG Course Marksheets', mandatory: 'All mandatory', totalDocs: 4 },
    { id: 4, appType: 'Duplicate Certificate', docRequired: 'Identity Proof, Copy of FIR (Lost Certificate), Affidavit from Notary public, Passport Photograph', mandatory: 'All mandatory', totalDocs: 4 },
    { id: 5, appType: 'Migration / Transfer', docRequired: 'Identity Proof, Current State Registration Certificate, NOC Request Letter, Employment Proof (New State)', mandatory: 'All mandatory', totalDocs: 4 },
    { id: 6, appType: 'No Objection Certificate (NOC)', docRequired: 'Identity Proof, State Registration Certificate, Migration Form request, Destination State requirement list', mandatory: 'NOC Request mandatory', totalDocs: 3 },
    { id: 7, appType: 'Good Standing Certificate', docRequired: 'Identity Proof, Current Registration Certificate, Character Certificate, Employer Recommendation Letter', mandatory: 'First 3 mandatory', totalDocs: 4 }
  ]);

  // Dialog & Form States
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [formMap, setFormMap] = useState<ApplicationMap>({
    id: 0,
    appType: '',
    docRequired: '',
    mandatory: 'All mandatory',
    totalDocs: 1
  });

  const workflows = ['Fresh Registration', 'Renewal of Registration', 'Additional Qualification', 'Duplicate Certificate', 'Migration / Transfer', 'No Objection Certificate (NOC)', 'Good Standing Certificate', 'Restoration'];
  const rules = ['All mandatory', 'First 3 mandatory', 'First 2 mandatory', 'NOC Request mandatory', 'Optional'];

  const openNewMap = () => {
    setDialogMode('add');
    setFormMap({
      id: 0,
      appType: workflows[0],
      docRequired: '',
      mandatory: 'All mandatory',
      totalDocs: 1
    });
    setDialogVisible(true);
  };

  const editMap = (map: ApplicationMap) => {
    setDialogMode('edit');
    setFormMap({ ...map });
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const saveMap = () => {
    if (!formMap.appType.trim() || !formMap.docRequired.trim() || formMap.totalDocs <= 0) {
      toast.current?.show({ severity: 'error', summary: 'Validation Failed', detail: 'Please fill in required fields and ensure total uploads > 0.', life: 3000 });
      return;
    }

    if (dialogMode === 'add') {
      if (mappings.some(m => m.appType.toLowerCase() === formMap.appType.toLowerCase())) {
        toast.current?.show({ severity: 'error', summary: 'Mapping Exists', detail: `Workflow mapping for '${formMap.appType}' already defined.`, life: 3000 });
        return;
      }
      setMappings([...mappings, { ...formMap, id: Date.now() }]);
      toast.current?.show({ severity: 'success', summary: 'Checklist Defined', detail: `Document requirements mapped for ${formMap.appType}.`, life: 3000 });
    } else {
      setMappings(mappings.map(m => m.id === formMap.id ? formMap : m));
      toast.current?.show({ severity: 'info', summary: 'Checklist Remapped', detail: `Requirements modified for ${formMap.appType}.`, life: 3000 });
    }

    setDialogVisible(false);
  };

  const deleteMap = (map: ApplicationMap) => {
    setMappings(mappings.filter(m => m.id !== map.id));
    toast.current?.show({ severity: 'warn', summary: 'Mapping Removed', detail: `Document requirements deleted for ${map.appType}.`, life: 3000 });
  };

  const syncMapping = (map: ApplicationMap) => {
    toast.current?.show({ severity: 'success', summary: 'Synchronized to State Councils', detail: `Remapped checklists for ${map.appType} successfully pushed to all state registries.`, life: 3000 });
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />

      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Masters</span>
        <span>/</span>
        <span className="font-semibold text-700">Application Mapping</span>
      </div>

      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">Workflow Document Mapping</h2>
          <p className="header-subtitle">Map and configure mandatory vs optional document upload checkers for each service workflow</p>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-4">
          <span className="p-input-icon-left w-full md:w-16rem">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={onSearchChange}
              placeholder="Search Workflow..."
              className="w-full text-sm py-2"
              style={{ borderRadius: '8px' }}
            />
          </span>
          <Button label="Define Document Map" icon="pi pi-plus" className="p-button-sm w-full md:w-auto" style={{ borderRadius: '8px' }} onClick={openNewMap} />
        </div>

        <DataTable
          value={mappings}
          filters={filters}
          onFilter={(e: any) => setFilters(e.filters as any)}
          globalFilterFields={['appType', 'docRequired', 'mandatory']}
          paginator
          rows={10}
          className="p-datatable-striped"
          responsiveLayout="scroll"
        >
          <Column field="appType" header="Service Workflow Type" sortable style={{ fontWeight: 600, width: '250px' }} />
          <Column field="docRequired" header="Required Checklist Items" />
          <Column field="totalDocs" header="Total Uploads" sortable style={{ width: '120px', textAlign: 'center' }} />
          <Column 
            field="mandatory" 
            header="Requirement Rule" 
            body={(row) => (
              <Tag severity="info" value={row.mandatory} />
            )}
            style={{ width: '160px' }}
          />
          <Column 
            header="Actions" 
            body={(row: ApplicationMap) => (
              <div className="flex gap-1">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-sm" onClick={() => editMap(row)} tooltip="Edit Mapping" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-refresh" className="p-button-rounded p-button-text p-button-sm" onClick={() => syncMapping(row)} tooltip="Sync Councils" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger p-button-sm" onClick={() => deleteMap(row)} tooltip="Delete Mapping" tooltipOptions={{ position: 'bottom' }} />
              </div>
            )}
            style={{ width: '120px' }}
          />
        </DataTable>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        header={dialogMode === 'add' ? 'Define Document checklist Map' : 'Edit Checklist Mapping'}
        visible={dialogVisible}
        style={{ width: '500px' }}
        modal
        className="p-fluid"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save Mapping" icon="pi pi-check" onClick={saveMap} />
          </div>
        }
        onHide={hideDialog}
      >
        <div className="flex flex-column gap-3 mt-2">
          <div className="flex flex-column gap-1">
            <label htmlFor="appType" className="text-xs font-semibold text-600">Service Workflow Type</label>
            <Dropdown id="appType" value={formMap.appType} options={workflows} disabled={dialogMode === 'edit'} onChange={(e) => setFormMap({ ...formMap, appType: e.value })} style={{ borderRadius: '8px' }} />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="docRequired" className="text-xs font-semibold text-600">Required Checklist Items (Comma Separated)</label>
            <InputText id="docRequired" value={formMap.docRequired} onChange={(e) => setFormMap({ ...formMap, docRequired: e.target.value })} placeholder="e.g. Identity Proof, Diploma Certificate" style={{ borderRadius: '8px' }} />
          </div>

          <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="flex flex-column gap-1">
              <label htmlFor="totalDocs" className="text-xs font-semibold text-600">Total Uploads Count</label>
              <InputText id="totalDocs" type="number" value={formMap.totalDocs.toString()} onChange={(e) => setFormMap({ ...formMap, totalDocs: parseInt(e.target.value) || 0 })} style={{ borderRadius: '8px' }} />
            </div>

            <div className="flex flex-column gap-1">
              <label htmlFor="mapRule" className="text-xs font-semibold text-600">Requirement Rule</label>
              <Dropdown id="mapRule" value={formMap.mandatory} options={rules} onChange={(e) => setFormMap({ ...formMap, mandatory: e.value })} style={{ borderRadius: '8px' }} />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ApplicationMapping;
