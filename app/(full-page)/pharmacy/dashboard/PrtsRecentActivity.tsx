"use client";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchApplicationListData,
  selectApplicationList,
  selectApplicationListLoading,
} from "@/store/slices";

interface ActivityRow {
  srNo: string;
  applicationType: string;
  orderId: string;
  feeReceiptNumber: string;
  paymentReference: string;
  amount: string;
  paymentDate: string;
  status: string;
  remarks: string;
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

function normalizeStatus(raw: string | undefined | null): string {
  if (!raw) return "Pending";
  const s = raw.toString().toLowerCase().replace(/[_-]/g, " ").trim();
  if (s === "approved" || s === "completed" || s === "success") return "Approved";
  if (s.includes("review") || s.includes("process") || s.includes("verif")) return "In Review";
  if (s === "pending" || s === "active" || s === "submitted") return "Pending";
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(raw: string | undefined | null): string {
  if (!raw) return "—";
  try {
    return new Date(raw).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

function mapToRows(list: any[]): ActivityRow[] {
  return list.map((item, index) => ({
    srNo: String(index + 1).padStart(3, "0"),
    applicationType: item.applicationType ?? item.application_type ?? item.applicationName ?? "—",
    orderId: item.orderId ?? item.order_id ?? "—",
    feeReceiptNumber: item.feeReceiptNumber ?? item.feeReceiptNo ?? item.fee_receipt_no ?? "—",
    paymentReference: item.paymentReference ?? item.payment_reference ?? "—",
    amount: item.amount != null ? `₹ ${item.amount}` : "—",
    paymentDate: formatDate(item.paymentDate ?? item.payment_date ?? item.createdAt),
    status: normalizeStatus(item.status ?? item.applicationStatus),
    remarks: item.remarks ?? "—",
  }));
}

const SHIMMER_WIDTHS = ["55%", "75%", "60%", "80%", "45%", "70%", "50%", "65%"];
const SKELETON_COLS = [
  { width: "5%"  },
  { width: "16%" },
  { width: "18%" },
  { width: "14%" },
  { width: "14%" },
  { width: "8%"  },
  { width: "10%" },
  { width: "10%", pill: true },
  { width: "5%"  },
];

function SkeletonTable() {
  return (
    <table className="prts-datatable-skeleton">
      <thead>
        <tr>
          {SKELETON_COLS.map((col, i) => (
            <th key={i} className="prts-skeleton-th" style={{ width: col.width }}>
              <div
                className="prts-skeleton prts-skeleton--text"
                style={{ height: 12, width: SHIMMER_WIDTHS[i % SHIMMER_WIDTHS.length], borderRadius: 4 }}
              />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, rowIdx) => (
          <tr key={rowIdx} className={rowIdx % 2 === 0 ? "prts-skeleton-row--odd" : "prts-skeleton-row--even"}>
            {SKELETON_COLS.map((col, colIdx) => (
              <td key={colIdx} className="prts-skeleton-td" style={{ width: col.width }}>
                {col.pill ? (
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

interface PrtsRecentActivityProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function PrtsRecentActivity({ limit, showViewAll = false }: PrtsRecentActivityProps) {
  const dispatch = useAppDispatch();
  const rawList = useAppSelector(selectApplicationList);
  const isLoading = useAppSelector(selectApplicationListLoading);

  const [rows] = useState(limit ?? 10);

  useEffect(() => {
    dispatch(fetchApplicationListData());
  }, [dispatch]);

  const allRows: ActivityRow[] = mapToRows(rawList);
  const tableData = limit ? allRows.slice(0, limit) : allRows;
  const totalRecords = allRows.length;

  const statusBody = (row: ActivityRow) => {
    const cfg = STATUS_CONFIG[row.status] ?? DEFAULT_STATUS_CONFIG;
    return (
      <span className={cfg.className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cfg.icon} alt={row.status} width={14} height={14} />
        {row.status}
      </span>
    );
  };

  return (
    <div className="prts-recent-activity">
      {/* TOP HEADER */}
      <div className="prts-recent-activity__top">
        <h2 className="prts-recent-activity__page-title">All Applications</h2>
      </div>

      {/* CARD */}
      <div className="prts-recent-activity__card">
        {/* CARD HEADER */}
        <div className="prts-recent-activity__header">
          <div className={`prts-recent-activity__title-row${!showViewAll ? " prts-recent-activity__title-row--spread" : ""}`}>
            <h3 className="prts-recent-activity__title">Applications list</h3>
            <span className="prts-recent-activity__count">
              {String(totalRecords).padStart(2, "0")} Records
            </span>
          </div>
          {showViewAll && (
            <Link href="/pharmacy/applications" className="prts-btn prts-btn--outline">
              View All
            </Link>
          )}
        </div>

        {/* TABLE */}
        <div className="prts-datatable-wrapper">
          {isLoading ? (
            <SkeletonTable />
          ) : (
            <DataTable
              value={tableData}
              rows={rows}
              className="prts-datatable"
              emptyMessage={
                <div style={{ textAlign: "center", width: "100%" }}>
                  No applications found.
                </div>
              }
            >
              <Column field="srNo" header="Sr No." style={{ width: "5%" }} />
              <Column field="applicationType" header="Application Type" style={{ width: "16%" }} />
              <Column field="orderId" header="Order ID" style={{ width: "18%" }} />
              <Column field="feeReceiptNumber" header="Fee Receipt No." style={{ width: "14%" }} />
              <Column field="paymentReference" header="Payment Reference" style={{ width: "14%" }} />
              <Column field="amount" header="Amount" style={{ width: "8%" }} />
              <Column field="paymentDate" header="Payment Date" style={{ width: "10%" }} />
              <Column header="Status" body={statusBody} style={{ width: "10%" }} />
            </DataTable>
          )}
        </div>
      </div>
    </div>
  );
}
