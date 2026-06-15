'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { FilterMatchMode } from 'primereact/api';

interface ApplicationType {
  code: string;
  name: string;
  fee: number;
  tat: number;
  status: string;
  description: string;
}

const ApplicationTypes = () => {
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
  const [appTypes, setAppTypes] = useState<ApplicationType[]>([
    { code: 'APP-FRESH', name: 'Fresh Registration', fee: 1500, tat: 15, status: 'Active', description: 'Initial registration request for pharmacy graduates' },
    { code: 'APP-RENEW', name: 'Renewal of Registration', fee: 1000, tat: 7, status: 'Active', description: 'Periodic registration renewal requests' },
    { code: 'APP-ADDQ', name: 'Additional Qualification', fee: 500, tat: 10, status: 'Active', description: 'Adding postgraduate or higher degrees to current profile' },
    { code: 'APP-DUPC', name: 'Duplicate Certificate', fee: 750, tat: 5, status: 'Active', description: 'Reissuing lost or damaged registration certificates' },
    { code: 'APP-MIGR', name: 'Migration / Transfer', fee: 2000, tat: 20, status: 'Active', description: 'Transferring pharmacy registration registry to another state' },
    { code: 'APP-NOC', name: 'No Objection Certificate (NOC)', fee: 1000, tat: 12, status: 'Active', description: 'NOC verification request for other jurisdictions' },
    { code: 'APP-GOOD', name: 'Good Standing Certificate', fee: 1500, tat: 10, status: 'Active', description: 'Verification letter confirming ethical status' },
    { code: 'APP-REST', name: 'Restoration', fee: 1200, tat: 14, status: 'Inactive', description: 'Restoring suspended or lapsed registrations' }
  ]);

  // Dialog & Form States
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [formType, setFormType] = useState<ApplicationType>({
    code: '',
    name: '',
    fee: 0,
    tat: 0,
    status: 'Active',
    description: ''
  });

  const statuses = ['Active', 'Inactive'];

  const openNewType = () => {
    setDialogMode('add');
    setFormType({
      code: '',
      name: '',
      fee: 0,
      tat: 0,
      status: 'Active',
      description: ''
    });
    setDialogVisible(true);
  };

  const editType = (type: ApplicationType) => {
    setDialogMode('edit');
    setFormType({ ...type });
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const saveType = () => {
    if (!formType.code.trim() || !formType.name.trim() || formType.fee <= 0 || formType.tat <= 0) {
      toast.current?.show({ severity: 'error', summary: 'Validation Failed', detail: 'Please provide valid Code, Name, Fee, and SLA Limit.', life: 3000 });
      return;
    }

    if (dialogMode === 'add') {
      // Check duplicate code
      if (appTypes.some(t => t.code.toUpperCase() === formType.code.toUpperCase())) {
        toast.current?.show({ severity: 'error', summary: 'Duplicate Code', detail: `Application Type Code '${formType.code}' already exists.`, life: 3000 });
        return;
      }
      setAppTypes([...appTypes, { ...formType, code: formType.code.toUpperCase() }]);
      toast.current?.show({ severity: 'success', summary: 'Workflow Created', detail: `${formType.name} configured successfully.`, life: 3000 });
    } else {
      setAppTypes(appTypes.map(t => t.code === formType.code ? formType : t));
      toast.current?.show({ severity: 'info', summary: 'Workflow Updated', detail: `${formType.name} configurations updated.`, life: 3000 });
    }

    setDialogVisible(false);
  };

  const deleteType = (type: ApplicationType) => {
    setAppTypes(appTypes.filter(t => t.code !== type.code));
    toast.current?.show({ severity: 'warn', summary: 'Workflow Deleted', detail: `${type.name} master registry removed.`, life: 3000 });
  };

  const configureSla = (type: ApplicationType) => {
    toast.current?.show({ severity: 'success', summary: 'SLA Recalibrated', detail: `Turnaround Time SLA guidelines for ${type.name} synchronized to all councils.`, life: 3000 });
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />

      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Masters</span>
        <span>/</span>
        <span className="font-semibold text-700">Application Types</span>
      </div>

      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">Application Types Master</h2>
          <p className="header-subtitle">View, edit, configure fees, and turnaround times (TAT) limits for all service workflows</p>
        </div>
      </div>

      <div className="dashboard-panel">
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 mb-4">
          <span className="p-input-icon-left w-full md:w-16rem">
            <i className="pi pi-search" />
            <InputText
              value={globalFilter}
              onChange={onSearchChange}
              placeholder="Search Code, Name..."
              className="w-full text-sm py-2"
              style={{ borderRadius: '8px' }}
            />
          </span>
          <Button label="Add Application Type" icon="pi pi-plus" className="p-button-sm w-full md:w-auto" style={{ borderRadius: '8px' }} onClick={openNewType} />
        </div>

        <DataTable
          value={appTypes}
          filters={filters}
          onFilter={(e: any) => setFilters(e.filters as any)}
          globalFilterFields={['code', 'name', 'description']}
          paginator
          rows={10}
          className="p-datatable-striped"
          responsiveLayout="scroll"
        >
          <Column field="code" header="Workflow Code" sortable style={{ fontWeight: 600 }} />
          <Column field="name" header="Service Name" sortable />
          <Column field="fee" header="Standard Fee" sortable body={(row) => `₹ ${row.fee.toLocaleString()}`} />
          <Column field="tat" header="TAT SLA Limit" sortable body={(row) => `${row.tat} Days`} />
          <Column field="description" header="Workflow Description" />
          <Column 
            field="status" 
            header="Status" 
            sortable 
            body={(row) => (
              <Tag severity={row.status === 'Active' ? 'success' : 'danger'} value={row.status} />
            )}
          />
          <Column 
            header="Actions" 
            body={(row: ApplicationType) => (
              <div className="flex gap-1">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-text p-button-sm" onClick={() => editType(row)} tooltip="Edit Details" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-cog" className="p-button-rounded p-button-text p-button-sm" onClick={() => configureSla(row)} tooltip="Configure SLA" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger p-button-sm" onClick={() => deleteType(row)} tooltip="Delete Workflow" tooltipOptions={{ position: 'bottom' }} />
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        header={dialogMode === 'add' ? 'Create New Application Workflow' : 'Modify Workflow parameters'}
        visible={dialogVisible}
        style={{ width: '450px' }}
        modal
        className="p-fluid"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save Changes" icon="pi pi-check" onClick={saveType} />
          </div>
        }
        onHide={hideDialog}
      >
        <div className="flex flex-column gap-3 mt-2">
          <div className="flex flex-column gap-1">
            <label htmlFor="typeCode" className="text-xs font-semibold text-600">Workflow Code</label>
            <InputText id="typeCode" value={formType.code} disabled={dialogMode === 'edit'} onChange={(e) => setFormType({ ...formType, code: e.target.value })} placeholder="e.g. APP-FRESH" style={{ borderRadius: '8px' }} />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="typeName" className="text-xs font-semibold text-600">Workflow Name</label>
            <InputText id="typeName" value={formType.name} onChange={(e) => setFormType({ ...formType, name: e.target.value })} placeholder="e.g. Fresh Registration" style={{ borderRadius: '8px' }} />
          </div>

          <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="flex flex-column gap-1">
              <label htmlFor="typeFee" className="text-xs font-semibold text-600">Standard Fee (₹)</label>
              <InputNumber id="typeFee" value={formType.fee} onValueChange={(e) => setFormType({ ...formType, fee: e.value || 0 })} mode="currency" currency="INR" locale="en-IN" style={{ borderRadius: '8px' }} />
            </div>

            <div className="flex flex-column gap-1">
              <label htmlFor="typeTat" className="text-xs font-semibold text-600">TAT SLA (Days)</label>
              <InputNumber id="typeTat" value={formType.tat} onValueChange={(e) => setFormType({ ...formType, tat: e.value || 0 })} suffix=" Days" style={{ borderRadius: '8px' }} />
            </div>
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="typeDesc" className="text-xs font-semibold text-600">Workflow Description</label>
            <InputText id="typeDesc" value={formType.description} onChange={(e) => setFormType({ ...formType, description: e.target.value })} placeholder="Enter details" style={{ borderRadius: '8px' }} />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="typeStatus" className="text-xs font-semibold text-600">Workflow Registry Status</label>
            <Dropdown id="typeStatus" value={formType.status} options={statuses} onChange={(e) => setFormType({ ...formType, status: e.value })} style={{ borderRadius: '8px' }} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ApplicationTypes;
