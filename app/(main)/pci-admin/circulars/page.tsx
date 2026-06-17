"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { FilterMatchMode } from "primereact/api";
import EmptyTableMessage from "@/components/EmptyTableMessage";

function safeJson(raw: any) {
  if (!raw) return raw;
  if (typeof raw === "object" && raw.default !== undefined) {
    const keys = Object.keys(raw);
    const hasOtherKeys = keys.some(
      (k) => k !== "default" && k !== "__esModule",
    );
    if (!hasOtherKeys) return raw.default;
  }
  return raw;
}

import circularsDataRaw from "@/jsondata/circulars.json";
const circularsData = safeJson(circularsDataRaw);

const CircularsCenter = () => {
  const router = useRouter();
  const toast = useRef<Toast>(null);

  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [circulars, setCirculars] = useState<any[]>(circularsData || []);

  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [formCirc, setFormCirc] = useState<any>({});
  
  // File upload state and handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const categories = [
    "Academic",
    "Administrative",
    "Regulatory Compliance",
    "IT & E-Governance",
  ];
  const recipients = [
    "All Pharmacy Institutions",
    "State Pharmacy Councils",
    "Registered Pharmacists",
    "Public Domain",
  ];
  const statuses = ["Published", "Draft", "Archived"];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setSelectedFile(file);
      } else {
        toast.current?.show({
          severity: "error",
          summary: "Invalid File Type",
          detail: "Please upload a PDF document.",
          life: 3000,
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const openNewCirc = () => {
    setFormCirc({
      id: `CIRC-2024-${100 + circulars.length}`,
      title: "",
      date: new Date().toISOString().split("T")[0],
      category: "Administrative",
      recipient: "All Pharmacy Institutions",
      status: "Draft",
    });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setDialogVisible(true);
  };

  const saveCirc = () => {
    if (!formCirc.title.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Validation Failed",
        detail: "Title is required.",
        life: 3000,
      });
      return;
    }
    const newNotice = {
      ...formCirc,
      attachment: selectedFile ? selectedFile.name : null,
      status: "Published"
    };
    setCirculars([newNotice, ...circulars]);
    toast.current?.show({
      severity: "success",
      summary: "Notice Created",
      detail: `Circular successfully mapped.`,
      life: 3000,
    });
    setDialogVisible(false);
  };

  return (
    <div className="super-admin-dashboard">
      <Toast ref={toast} />
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span
          className="hover:underline cursor-pointer"
          onClick={() => router.push("/pci-admin/dashboard")}
        >
          National Dashboard
        </span>
        <span>/</span>
        <span className="font-semibold text-700">
          Circulars & Notifications
        </span>
      </div>

      <div className="fal-page-header">
        <div className="fal-page-header__inner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="fal-page-header__icon-wrap">
              <i className="pi pi-bell" />
            </div>
            <div className="fal-page-header__text">
              <h1 className="fal-page-header__title">
                PCI Official Notifications Board
              </h1>
              <p className="fal-page-header__subtitle">
                Publish circulars, advisories, and syllabus modifications across
                councils and institutions
              </p>
            </div>
          </div>
          <div className="fal-page-header__meta">
            <span className="fal-page-header__badge">
              <i className="pi pi-list" />
              {circulars.length} Total
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
                setFilters({
                  global: { value: val, matchMode: FilterMatchMode.CONTAINS },
                } as any);
              }}
              placeholder="Search Subject..."
              className="w-full text-sm py-2"
              style={{ borderRadius: "8px", maxWidth: "300px" }}
            />
          </span>
          <Button
            label="Publish Circular"
            icon="pi pi-send"
            className="p-button-sm w-full md:w-auto"
            style={{ borderRadius: "8px", maxWidth: "160px" }}
            onClick={openNewCirc}
          />
        </div>

        <DataTable
          showGridlines
          value={circulars}
          filters={filters}
          onFilter={(e) => setFilters(e.filters as any)}
          globalFilterFields={["title", "category"]}
          paginator
          rows={10}
          className="p-datatable-striped"
          emptyMessage={<EmptyTableMessage message="No official circulars or announcements found." />}
          responsiveLayout="scroll"
        >
          <Column
            field="id"
            header="Circular ID"
            sortable
            style={{ fontWeight: 600, width: "120px" }}
          />
          <Column field="title" header="Subject / Title" sortable />
          <Column
            field="date"
            header="Date Issued"
            sortable
            style={{ width: "120px" }}
          />
          <Column field="category" header="Domain" sortable />
          <Column field="recipient" header="Addressed To" />
          <Column
            field="status"
            header="Status"
            sortable
            body={(row) => {
              const statusClass = 
                row.status === "Published" ? "fal-status--approved" :
                row.status === "Draft" ? "fal-status--pending" :
                "fal-status--rejected";
              return (
                <span className={`fal-status ${statusClass}`}>
                  {row.status}
                </span>
              );
            }}
          />
          <Column
            header="Actions"
            body={(row) => (
              <div className="flex gap-2 justify-content-center">
                <Button
                  icon="pi pi-eye"
                  className="fal-action-btn"
                  tooltip="View PDF"
                  tooltipOptions={{ position: "bottom" }}
                />
                <Button
                  icon="pi pi-trash"
                  className="fal-action-btn"
                  style={{ color: '#ef4444' }}
                  onClick={() => {
                    setCirculars(circulars.filter((c) => c.id !== row.id));
                    toast.current?.show({
                      severity: "warn",
                      summary: "Deleted",
                      detail: "Circular archived",
                    });
                  }}
                  tooltip="Delete"
                  tooltipOptions={{ position: "bottom" }}
                />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        header="Compose Official Notification"
        visible={dialogVisible}
        style={{ width: "500px" }}
        modal
        className="p-fluid"
        footer={
          <div className="flex justify-content-end gap-2">
            <Button
              label="Cancel"
              icon="pi pi-times"
              className="p-button-text"
              onClick={() => setDialogVisible(false)}
            />
            <Button
              label="Save & Publish"
              icon="pi pi-check"
              onClick={saveCirc}
            />
          </div>
        }
        onHide={() => setDialogVisible(false)}
      >
        <div className="flex flex-column gap-3 mt-2">
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">
              Circular Subject / Title
            </label>
            <InputText
              value={formCirc.title}
              onChange={(e) =>
                setFormCirc({ ...formCirc, title: e.target.value })
              }
            />
          </div>
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">
              Category Domain
            </label>
            <Dropdown
              value={formCirc.category}
              options={categories}
              className="w-full"
              onChange={(e) => setFormCirc({ ...formCirc, category: e.value })}
            />
          </div>
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">
              Target Recipients
            </label>
            <Dropdown
              value={formCirc.recipient}
              options={recipients}
              className="w-full"
              onChange={(e) => setFormCirc({ ...formCirc, recipient: e.value })}
            />
          </div>
          <div className="flex flex-column gap-1">
            <label className="text-xs font-semibold text-600">
              Upload PDF Attachment
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div
              className="p-3 border-dashed border-2 border-round text-center cursor-pointer transition-colors transition-duration-150"
              style={{
                backgroundColor: isDragOver ? "#eff6ff" : "#f8fafc",
                borderColor: isDragOver ? "#3b82f6" : "#cbd5e1",
                color: "#64748b"
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex align-items-center justify-content-between p-1">
                  <div className="flex align-items-center gap-2">
                    <i className="pi pi-file-pdf text-red-500 text-2xl" />
                    <div className="text-left">
                      <span className="block text-xs font-semibold text-800 max-w-15rem truncate">{selectedFile.name}</span>
                      <span className="block text-xs text-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-text p-button-danger p-button-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
                </div>
              ) : (
                <>
                  <i className="pi pi-cloud-upload text-3xl text-500 mb-2"></i>
                  <span className="block text-sm text-600 font-medium">
                    Click to browse or drag file here
                  </span>
                  <span className="block text-xs text-400 mt-1">
                    Only PDF files are supported
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
export default CircularsCenter;
