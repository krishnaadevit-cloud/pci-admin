"use client";

import { ChangeEvent, useCallback, useEffect, useRef } from "react";
import {
  MAX_DOCUMENT_BYTES,
  formatFileSize,
  type DocumentRowState,
} from "./registrationState";
import Image from "next/image";

function isAllowedFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
}

export interface DocumentUploadTableProps {
  title: string;
  documents: DocumentRowState[];
  onUpdate: (id: number, patch: Partial<DocumentRowState>) => void;
  onValidate?: (file: File) => Promise<string | null>;
  onValidationError?: (message: string) => void;
  showDigiLocker?: boolean;
}

export default function DocumentUploadTable({
  title,
  documents,
  onUpdate,
  onValidate,
  onValidationError,
  showDigiLocker = true,
}: DocumentUploadTableProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIdRef = useRef<number | null>(null);
  const uploadTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {},
  );

  const clearUploadTimer = useCallback((id: number) => {
    const t = uploadTimersRef.current[id];
    if (t) clearTimeout(t);
    delete uploadTimersRef.current[id];
  }, []);

  const finishUpload = useCallback(
    async (id: number, file: File) => {
      clearUploadTimer(id);
      if (onValidate) {
        const error = await onValidate(file);
        if (error) {
          onValidationError?.(error);
          onUpdate(id, { status: "pending", fileName: undefined, fileSize: undefined, fileObject: undefined, digiFetchDisabled: false, selected: false });
          return;
        }
      }
      onUpdate(id, {
        status: "uploaded",
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileObject: file,
        digiFetchDisabled: true,
        selected: true,
      });
    },
    [clearUploadTimer, onUpdate, onValidate, onValidationError],
  );

  const finishUploadRef = useRef(finishUpload);
  useEffect(() => {
    finishUploadRef.current = finishUpload;
  });

  const processSelectedFile = useCallback(
    (id: number, file: File | undefined) => {
      if (!file) return;

      if (!isAllowedFile(file)) {
        onUpdate(id, {
          status: "failed",
          fileName: file.name,
          fileSize: "Only PDF allowed",
          fileObject: undefined,
          digiFetchDisabled: false,
        });
        return;
      }

      if (file.size > MAX_DOCUMENT_BYTES) {
        onUpdate(id, {
          status: "failed",
          fileName: file.name,
          fileSize: `Exceeds ${formatFileSize(MAX_DOCUMENT_BYTES)}`,
          fileObject: undefined,
          digiFetchDisabled: false,
        });
        return;
      }

      clearUploadTimer(id);
      onUpdate(id, {
        status: "uploading",
        fileName: file.name,
        fileSize: `0 KB of ${formatFileSize(file.size)}`,
        fileObject: file,
        digiFetchDisabled: false,
      });

      uploadTimersRef.current[id] = setTimeout(() => {
        finishUploadRef.current(id, file);
      }, 650);
    },
    [clearUploadTimer, onUpdate],
  );

  const triggerFilePick = (rowId: number) => {
    uploadTargetIdRef.current = rowId;
    fileInputRef.current?.click();
  };

  const onHiddenFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const id = uploadTargetIdRef.current;
    const file = e.target.files?.[0];
    e.target.value = "";
    uploadTargetIdRef.current = null;
    if (id == null || !file) return;
    processSelectedFile(id, file);
  };

  const resetRow = (row: DocumentRowState) => {
    clearUploadTimer(row.id);
    onUpdate(row.id, {
      status: "pending",
      fileName: undefined,
      fileSize: undefined,
      fileObject: undefined,
      digiFetchDisabled: false,
      selected: false,
    });
  };

  const retryUpload = (row: DocumentRowState) => {
    resetRow(row);
    triggerFilePick(row.id);
  };

  const viewFile = (row: DocumentRowState) => {
    if (row.downloadUrl) {
      window.open(row.downloadUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (!row.fileObject) return;
    const url = URL.createObjectURL(row.fileObject);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 120_000);
  };

  const uploaded = documents.filter((d) => d.status === "uploaded").length;
  const failed = documents.filter((d) => d.status === "failed").length;
  const pending = documents.filter(
    (d) => d.status === "pending" || d.status === "uploading",
  ).length;

  const renderUploadCell = (row: DocumentRowState) => {
    if (row.status === "uploaded") { 
      return (
        <div className="prts-doc-cell">
          <div className="prts-doc-cell__file">
            <Image
              src="/assets/fresh-registration/pdf.svg"
              alt="PDF"
              width={40}
              height={48}
            />

            <div className="prts-doc-cell__file-info">
              <span className="prts-doc-cell__file-name">{row.fileName}</span>
              <span style={{ display: "flex" }}>
                <span className="prts-doc-cell__file-size">{row.fileSize}</span>
                <>
                {console.log("row.downloadUrl", row)}
                </>
                <span className="prts-doc-cell__file-meta prts-doc-cell__file-meta--success">
                  • Completed
                </span>
              </span>
            </div>
          </div>

          <div className="prts-doc-cell__actions">
            <button
              type="button"
              className="prts-doc-cell__icon-btn"
              aria-label="View"
              onClick={() => viewFile(row)}
            >
              <Image
                src="/assets/fresh-registration/view.svg"
                alt="View"
                width={30}
                height={30}
              />
            </button>

            <button
              type="button"
              className="prts-doc-cell__icon-btn"
              aria-label="Delete"
              onClick={() => resetRow(row)}
            >
              <Image
                src="/assets/fresh-registration/delete.svg"
                alt="Delete"
                width={30}
                height={30}
              />
            </button>
          </div>
        </div>
      );
    }

    if (row.status === "uploading") {
      return (
        <div className="prts-doc-cell">
          <div className="prts-doc-cell__file">
            <Image
              src="/assets/fresh-registration/pdf.svg"
              alt="PDF"
              width={40}
              height={48}
            />

            <div className="prts-doc-cell__file-info">
              <span className="prts-doc-cell__file-name">{row.fileName}</span>
              <span className="prts-doc-cell__file-meta">
                {row.fileSize}
                <span className="prts-doc-cell__uploading-text">
                  Uploading…
                </span>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="prts-doc-cell__icon-btn"
            aria-label="Cancel"
            onClick={() => resetRow(row)}
          >
            <Image
              src="/assets/fresh-registration/cancel.svg"
              alt="Cancel"
              width={30}
              height={30}
            />
          </button>
        </div>
      );
    }

    if (row.status === "failed") {
      return (
        <div className="prts-doc-cell prts-doc-cell--failed">
          <div className="prts-doc-cell__file">
            <Image
              src="/assets/fresh-registration/pdf.svg"
              alt="PDF"
              width={40}
              height={48}
            />

            <div className="prts-doc-cell__file-info">
              <span className="prts-doc-cell__file-name">{row.fileName}</span>
              <span className="prts-doc-cell__file-meta prts-doc-cell__file-meta--error">
                Upload failed: file limit exceeds 1MB
              </span>
            </div>
          </div>
          <button
            type="button"
            className="prts-btn prts-btn--outline prts-btn--sm"
            onClick={() => retryUpload(row)}
          >
            <Image
              src="/assets/fresh-registration/upload.svg"
              alt="Upload"
              width={12}
              height={12}
            />

            <span>Retry</span>
          </button>
        </div>
      );
    }

    return (
      <div className="prts-doc-cell prts-doc-cell--pending">
        <button
          type="button"
          className="prts-btn prts-btn--outline prts-btn--sm"
          onClick={() => triggerFilePick(row.id)}
        >
          <Image
            src="/assets/fresh-registration/upload.svg"
            alt="Upload"
            width={12}
            height={12}
          />

          <span>Upload File</span>
        </button>

        <span className="prts-doc-cell__no-file">No File Chosen</span>
      </div>
    );
  };
  return (
    <div className="prts-education-documents">
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        accept=".pdf,application/pdf"
        aria-hidden
        tabIndex={-1}
        onChange={onHiddenFileChange}
      />

      <div className="prts-fetch-documents__table-header">
        <h2 className="prts-fetch-documents__table-title">
          {title}
          {showDigiLocker && (
            <button
              type="button"
              className="prts-btn prts-btn--outline prts-btn--sm prts-btn--digi0"
            >
              <span className="prts-btn--digi0__inner">
                <img
                  src="/assets/fresh-registration/document.svg"
                  alt=""
                  className="prts-btn__icon"
                  width={19}
                  height={18}
                />
                <span>Fetch via DigiLocker </span>
              </span>
            </button>
          )}
        </h2>
        <div className="prts-fetch-documents__table-header-right">
          <div className="prts-fetch-documents__badges">
            <span className="prts-status-badge prts-status-badge--uploaded">
              {uploaded} • Uploaded
            </span>
            <span className="prts-status-badge prts-status-badge--pending">
              {pending} • Pending
            </span>
            <span className="prts-status-badge prts-status-badge--failed">
              {failed} • Failed
            </span>
          </div>
        </div>
      </div>

      <p className="prts-doc-table-scroll__hint" aria-hidden="true">
        Scroll horizontally to view all columns
      </p>
      <div className="prts-html-table-wrapper prts-html-table-wrapper--documents prts-html-table-wrapper--scroll">
        <table className="prts-html-table prts-html-table--documents">
          <thead>
            <tr>
              <th className="prts-html-table__col-check" />
              <th className="prts-html-table__col-no">No.</th>
              <th>Document Name</th>
              <th className="prts-html-table__col-upload">Upload</th>
              <th className="prts-html-table__col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "1.5rem", color: "#888" }}>
                  No Data Found
                </td>
              </tr>
            )}
            {documents.map((row, index) => (
              <tr
                key={row.id}
                className={
                  row.status === "uploaded"
                    ? "prts-doc-row--success"
                    : row.status === "uploading"
                    ? "prts-doc-row--uploading"
                    : row.status === "failed"
                    ? "prts-doc-row--failed"
                    : ""
                }
              >
                <td className="prts-html-table__col-check">
                  <input
                    type="checkbox"
                    checked={row.status === "uploaded"}
                    disabled={row.status === "uploaded"}
                    onChange={(e) =>
                      onUpdate(row.id, { selected: e.target.checked })
                    }
                    className={`prts-table-checkbox ${
                      row.status === "uploaded"
                        ? "prts-table-checkbox--success"
                        : ""
                    }`}
                    aria-label={`Select ${row.name}`}
                  />
                </td>
                <td className="prts-html-table__col-no">{index + 1}</td>
                <td>
                  <span className="prts-doc-name">
                    {row.name}
                    {row.isRequired && (
                      <span className="prts-required-asterisk">*</span>
                    )}
                  </span>
                </td>
                <td>{renderUploadCell(row)}</td>
                <td>
                  <button
                    type="button"
                    disabled={row.digiFetchDisabled}
                    className={`prts-btn prts-btn--outline prts-btn--sm prts-btn--digi ${
                      row.digiFetchDisabled ? "prts-btn--disabled" : ""
                    }`}
                  >
                    <span className="prts-btn--digi__inner">
                      <img
                        src="/assets/fresh-registration/cloud.svg"
                        alt=""
                        className="prts-btn__icon"
                        width={16}
                        height={16}
                      />
                      <span>Fetch via Digi-Pharmed</span>
                    </span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
