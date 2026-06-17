"use client";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useState } from "react";

export interface PageTableColumn {
  field: string;
  header: string;
  width?: string;
  body?: (row: any) => React.ReactNode;
}

export interface PageTableProps {
  pageTitle: string;
  tableTitle: string;
  data: any[];
  columns: PageTableColumn[];
  isLoading?: boolean;
  emptyMessage?: string;
  defaultRows?: number;
}

const STATUS_CONFIG: Record<string, { className: string; icon: string }> = {
  Pending: {
    className: "prts-status-tag prts-status-tag--pending",
    icon: "/assets/dashboard/pending.svg",
  },
  "In Review": {
    className: "prts-status-tag prts-status-tag--review",
    icon: "/assets/dashboard/review.svg",
  },
  Approved: {
    className: "prts-status-tag prts-status-tag--approved",
    icon: "/assets/dashboard/approved.svg",
  },
};

const DEFAULT_STATUS_CONFIG = {
  className: "prts-status-tag prts-status-tag--pending",
  icon: "/assets/dashboard/pending.svg",
};

export function statusBodyTemplate(row: any, field = "status") {
  const status = row[field] ?? "Pending";
  const cfg = STATUS_CONFIG[status] ?? DEFAULT_STATUS_CONFIG;
  return (
    <span className={cfg.className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cfg.icon} alt={status} width={14} height={14} />
      {status}
    </span>
  );
}

// Shimmer widths cycle per (row, col) position for a natural look
const SHIMMER_WIDTHS = ["55%", "75%", "60%", "80%", "45%", "70%", "50%", "65%"];
const SKELETON_ROWS  = 5;

function SkeletonTable({ columns }: { columns: PageTableColumn[] }) {
  return (
    <table className="prts-datatable-skeleton">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={col.field} className="prts-skeleton-th" style={{ width: col.width }}>
              <div
                className="prts-skeleton prts-skeleton--text"
                style={{ height: 12, width: SHIMMER_WIDTHS[i % SHIMMER_WIDTHS.length], borderRadius: 4 }}
              />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: SKELETON_ROWS }).map((_, rowIdx) => (
          <tr key={rowIdx} className={rowIdx % 2 === 0 ? "prts-skeleton-row--odd" : "prts-skeleton-row--even"}>
            {columns.map((col, colIdx) => (
              <td key={col.field} className="prts-skeleton-td" style={{ width: col.width }}>
                {colIdx === columns.length - 1 ? (
                  // Last column mimics a status pill
                  <div
                    className="prts-skeleton prts-skeleton--text"
                    style={{ height: 26, width: "80px", borderRadius: 999 }}
                  />
                ) : (
                  <div
                    className="prts-skeleton prts-skeleton--text"
                    style={{
                      height: 14,
                      width: SHIMMER_WIDTHS[(rowIdx + colIdx) % SHIMMER_WIDTHS.length],
                      borderRadius: 4,
                    }}
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function PrtsPageTable({
  pageTitle,
  tableTitle,
  data,
  columns,
  isLoading = false,
  emptyMessage,
  defaultRows = 10,
}: PageTableProps) {
  const [rows] = useState(defaultRows);
  const totalRecords = data.length;

  return (
    <div className="prts-recent-activity">
      <div className="prts-recent-activity__top">
        <h2 className="prts-recent-activity__page-title">{pageTitle}</h2>
      </div>

      <div className="prts-recent-activity__card">
        <div className="prts-recent-activity__header">
          <div className="prts-recent-activity__title-row prts-recent-activity__title-row--spread">
            <h3 className="prts-recent-activity__title">{tableTitle}</h3>
            <span className="prts-recent-activity__count">
              {String(totalRecords).padStart(2, "0")} Records
            </span>
          </div>
        </div>

        <div className="prts-datatable-wrapper">
          {isLoading ? (
            <SkeletonTable columns={columns} />
          ) : (
            <DataTable
              value={data}
              rows={rows}
              className="prts-datatable"
              emptyMessage={
                <div style={{ textAlign: "center", width: "100%" }}>
                  {emptyMessage ?? `No ${pageTitle.toLowerCase()} found.`}
                </div>
              }
            >
              {columns.map((col) => (
                <Column
                  key={col.field}
                  field={col.field}
                  header={col.header}
                  body={col.body}
                  style={col.width ? { width: col.width } : undefined}
                />
              ))}
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
}
