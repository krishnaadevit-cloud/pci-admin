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

interface DocumentType {
  code: string;
  name: string;
  category: string;
  format: string;
  maxSize: string;
  status: string;
}

const DocumentsMaster = () => {
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
  const [documents, setDocuments] = useState<DocumentType[]>([
    { code: 'DOC-ID', name: 'Identity Proof (Aadhaar / Passport)', category: 'Identity Verification', format: 'PDF', maxSize: '2MB', status: 'Active' },
    { code: 'DOC-DOB', name: 'Date of Birth Proof (Class X Certificate)', category: 'Age Verification', format: 'PDF', maxSize: '2MB', status: 'Active' },
    { code: 'DOC-DIPL', name: 'Diploma / Degree Certificate', category: 'Academic Credentials', format: 'PDF', maxSize: '5MB', status: 'Active' },
    { code: 'DOC-MARK', name: 'Official Marks Sheets (All Years)', category: 'Academic Credentials', format: 'PDF', maxSize: '10MB', status: 'Active' },
    { code: 'DOC-APPR', name: 'College Approval Letter (PCI)', category: 'Institution Accreditation', format: 'PDF', maxSize: '3MB', status: 'Active' },
    { code: 'DOC-TRAI', name: 'Practical Training Certificate (500 Hrs)', category: 'Training Credentials', format: 'PDF', maxSize: '4MB', status: 'Active' },
    { code: 'DOC-AFFI', name: 'Affidavit of Non-Employment', category: 'Declarations', format: 'PDF', maxSize: '2MB', status: 'Active' },
    { code: 'DOC-SIGN', name: 'Applicant Signature Scan', category: 'Bio-identification', format: 'JPG/PNG', maxSize: '500KB', status: 'Active' },
    { code: 'DOC-FOTO', name: 'Recent Passport Photograph', category: 'Bio-identification', format: 'JPG/PNG', maxSize: '1MB', status: 'Active' }
  ]);

  // Dialog & Form States
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [formDoc, setFormDoc] = useState<DocumentType>({
    code: '',
    name: '',
    category: 'Academic Credentials',
    format: 'PDF',
    maxSize: '2MB',
    status: 'Active'
  });

  const categories = ['Identity Verification', 'Age Verification', 'Academic Credentials', 'Institution Accreditation', 'Training Credentials', 'Declarations', 'Bio-identification'];
  const formats = ['PDF', 'JPG/PNG', 'PDF, JPG/PNG'];
  const sizes = ['500KB', '1MB', '2MB', '3MB', '4MB', '5MB', '10MB'];
  const statuses = ['Active', 'Inactive'];

  const openNewDoc = () => {
    setDialogMode('add');
    setFormDoc({
      code: '',
      name: '',
      category: 'Academic Credentials',
      format: 'PDF',
      maxSize: '2MB',
      status: 'Active'
    });
    setDialogVisible(true);
  };

  const editDoc = (doc: DocumentType) => {
    setDialogMode('edit');
    setFormDoc({ ...doc });
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

  const saveDoc = () => {
    if (!formDoc.code.trim() || !formDoc.name.trim()) {
      toast.current?.show({ severity: 'error', summary: 'Validation Failed', detail: 'Please fill in Document Code and Title.', life: 3000 });
      return;
    }

    if (dialogMode === 'add') {
      if (documents.some(d => d.code.toUpperCase() === formDoc.code.toUpperCase())) {
        toast.current?.show({ severity: 'error', summary: 'Duplicate Code', detail: `Document Code '${formDoc.code}' already exists.`, life: 3000 });
        return;
      }
      setDocuments([...documents, { ...formDoc, code: formDoc.code.toUpperCase() }]);
      toast.current?.show({ severity: 'success', summary: 'Document Defined', detail: `${formDoc.name} added to master list.`, life: 3000 });
    } else {
      setDocuments(documents.map(d => d.code === formDoc.code ? formDoc : d));
      toast.current?.show({ severity: 'info', summary: 'Document Updated', detail: `${formDoc.name} parameters modified.`, life: 3000 });
    }

    setDialogVisible(false);
  };

  const deleteDoc = (doc: DocumentType) => {
    setDocuments(documents.filter(d => d.code !== doc.code));
    toast.current?.show({ severity: 'warn', summary: 'Document Removed', detail: `${doc.name} deleted from master list.`, life: 3000 });
  };

  const configureVerification = (doc: DocumentType) => {
    toast.current?.show({ severity: 'success', summary: 'OCR Rule Synchronized', detail: `OCR signature and integrity checks updated for ${doc.name}.`, life: 3000 });
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />

      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Masters</span>
        <span>/</span>
        <span className="font-semibold text-700">Documents</span>
      </div>

      <div className="fal-page-header">
        <div className="fal-page-header__inner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="fal-page-header__icon-wrap">
              <i className="pi pi-folder" />
            </div>
            <div className="fal-page-header__text">
              <h1 className="fal-page-header__title">Documents Registry Master</h1>
              <p className="fal-page-header__subtitle">View, configure, update upload parameters, size limits, and categories for required documents</p>
            </div>
          </div>
          <div className="fal-page-header__meta">
            <span className="fal-page-header__badge">
              <i className="pi pi-list" />
              {documents.length} Total
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
              onChange={onSearchChange}
              placeholder="Search Document, Category..."
              className="w-full text-sm py-2"
              style={{ borderRadius: '8px' }}
            />
          </span>
          <Button label="Define Document Type" icon="pi pi-plus" className="p-button-sm w-full md:w-auto" style={{ borderRadius: '8px' }} onClick={openNewDoc} />
        </div>

        <DataTable
          value={documents}
          filters={filters}
          onFilter={(e) => setFilters(e.filters as any)}
          globalFilterFields={['code', 'name', 'category', 'format', 'maxSize']}
          paginator
          showGridlines 
          rows={10}
          className="p-datatable-striped"
          emptyMessage={<EmptyTableMessage message="No required documents configured." />}
          responsiveLayout="scroll"
        >
          <Column field="code" header="Document Code" sortable style={{ fontWeight: 600 }} />
          <Column field="name" header="Document Title" sortable />
          <Column field="category" header="Verification Category" sortable />
          <Column field="format" header="Supported Format" sortable />
          <Column field="maxSize" header="Maximum File Size" />
          <Column 
            field="status" 
            header="Status" 
            sortable 
            body={(row) => (
              <span className={`fal-status ${row.status === "Active" ? "fal-status--approved" : "fal-status--rejected"}`}>
                {row.status}
              </span>
            )}
          />
          <Column 
            header="Actions" 
            body={(row: DocumentType) => (
              <div className="flex gap-2 justify-content-center">
                <Button icon="pi pi-pencil" className="fal-action-btn" onClick={() => editDoc(row)} tooltip="Edit Parameters" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-shield" className="fal-action-btn" onClick={() => configureVerification(row)} tooltip="Configure OCR & Verification" tooltipOptions={{ position: 'bottom' }} />
                <Button icon="pi pi-trash" className="fal-action-btn" style={{ color: '#ef4444' }} onClick={() => deleteDoc(row)} tooltip="Remove Document" tooltipOptions={{ position: 'bottom' }} />
              </div>
            )}
          />
        </DataTable>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        header={dialogMode === 'add' ? 'Define New Required Document' : 'Modify Document Parameters'}
        visible={dialogVisible}
        style={{ width: '450px' }}
        modal
        className="p-fluid"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button label="Cancel" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Save Changes" icon="pi pi-check" onClick={saveDoc} />
          </div>
        }
        onHide={hideDialog}
      >
        <div className="flex flex-column gap-3 mt-2">
          <div className="flex flex-column gap-1">
            <label htmlFor="docCode" className="text-xs font-semibold text-600">Document Code</label>
            <InputText id="docCode" value={formDoc.code} disabled={dialogMode === 'edit'} onChange={(e) => setFormDoc({ ...formDoc, code: e.target.value })} placeholder="e.g. DOC-MARK" style={{ borderRadius: '8px' }} />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="docName" className="text-xs font-semibold text-600">Document Title</label>
            <InputText id="docName" value={formDoc.name} onChange={(e) => setFormDoc({ ...formDoc, name: e.target.value })} placeholder="e.g. Class XII Marksheet" style={{ borderRadius: '8px' }} />
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="docCategory" className="text-xs font-semibold text-600">Verification Category</label>
            <Dropdown id="docCategory" value={formDoc.category} options={categories} onChange={(e) => setFormDoc({ ...formDoc, category: e.value })} style={{ borderRadius: '8px' }} />
          </div>

          <div className="grid grid-cols-2 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="flex flex-column gap-1">
              <label htmlFor="docFormat" className="text-xs font-semibold text-600">Format</label>
              <Dropdown id="docFormat" value={formDoc.format} options={formats} onChange={(e) => setFormDoc({ ...formDoc, format: e.value })} style={{ borderRadius: '8px' }} />
            </div>

            <div className="flex flex-column gap-1">
              <label htmlFor="docSize" className="text-xs font-semibold text-600">Max Size</label>
              <Dropdown id="docSize" value={formDoc.maxSize} options={sizes} onChange={(e) => setFormDoc({ ...formDoc, maxSize: e.value })} style={{ borderRadius: '8px' }} />
            </div>
          </div>

          <div className="flex flex-column gap-1">
            <label htmlFor="docStatus" className="text-xs font-semibold text-600">Status</label>
            <Dropdown id="docStatus" value={formDoc.status} options={statuses} onChange={(e) => setFormDoc({ ...formDoc, status: e.value })} style={{ borderRadius: '8px' }} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DocumentsMaster;
