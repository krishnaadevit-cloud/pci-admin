"use client";

import { useEffect } from "react";
import PrtsDashboardSidebar from "../dashboard/PrtsDashboardSidebar";
import PrtsPageTable, { PageTableColumn } from "../dashboard/PrtsPageTable";
import { useDashboardSidebar } from "../DashboardSidebarContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchFeePaymentListData,
  selectFeePaymentList,
  selectFeePaymentListLoading,
} from "@/store/slices";

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

function receiptBodyTemplate(row: { feeReceipt?: string }) {
  if (!row.feeReceipt) return <span>—</span>;
  return (
    <a
      href={row.feeReceipt}
      target="_blank"
      rel="noopener noreferrer"
      className="prts-view-btn"
      aria-label="Download fee receipt"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_fee_receipt)">
          <path d="M5.76189 10.5712C5.92441 10.7338 6.11738 10.8628 6.32977 10.9508C6.54216 11.0388 6.76982 11.0841 6.99972 11.0841C7.22963 11.0841 7.45729 11.0388 7.66968 10.9508C7.88207 10.8628 8.07504 10.7338 8.23756 10.5712L10.1106 8.69808C10.2111 8.58701 10.2649 8.44158 10.2611 8.29188C10.2572 8.14219 10.196 7.99971 10.09 7.89394C9.984 7.78817 9.84139 7.72721 9.69169 7.72369C9.54199 7.72016 9.39666 7.77434 9.28581 7.875L7.57897 9.58242L7.58306 0.583333C7.58306 0.428624 7.5216 0.280251 7.4122 0.170854C7.30281 0.0614582 7.15443 0 6.99972 0V0C6.84501 0 6.69664 0.0614582 6.58725 0.170854C6.47785 0.280251 6.41639 0.428624 6.41639 0.583333L6.41114 9.57133L4.71364 7.875C4.60418 7.76562 4.45576 7.7042 4.30102 7.70426C4.14628 7.70431 3.9979 7.76583 3.88852 7.87529C3.77914 7.98475 3.71772 8.13317 3.71777 8.28792C3.71783 8.44266 3.77935 8.59104 3.88881 8.70042L5.76189 10.5712Z" fill="#212121" />
          <path d="M13.4167 9.33301C13.262 9.33301 13.1136 9.39447 13.0042 9.50386C12.8948 9.61326 12.8333 9.76163 12.8333 9.91634V12.2497C12.8333 12.4044 12.7719 12.5528 12.6625 12.6621C12.5531 12.7715 12.4047 12.833 12.25 12.833H1.75C1.59529 12.833 1.44692 12.7715 1.33752 12.6621C1.22812 12.5528 1.16667 12.4044 1.16667 12.2497V9.91634C1.16667 9.76163 1.10521 9.61326 0.995812 9.50386C0.886416 9.39447 0.738043 9.33301 0.583333 9.33301C0.428624 9.33301 0.280251 9.39447 0.170854 9.50386C0.0614582 9.61326 0 9.76163 0 9.91634L0 12.2497C0 12.7138 0.184374 13.1589 0.512563 13.4871C0.840752 13.8153 1.28587 13.9997 1.75 13.9997H12.25C12.7141 13.9997 13.1592 13.8153 13.4874 13.4871C13.8156 13.1589 14 12.7138 14 12.2497V9.91634C14 9.76163 13.9385 9.61326 13.8291 9.50386C13.7197 9.39447 13.5714 9.33301 13.4167 9.33301Z" fill="#212121" />
        </g>
        <defs>
          <clipPath id="clip0_fee_receipt">
            <rect width="14" height="14" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </a>
  );
}

const COLUMNS: PageTableColumn[] = [
  { field: "srNo",              header: "Sr No.",           width: "5%"  },
  { field: "applicationName",   header: "Application Name", width: "14%" },
  { field: "orderId",           header: "Order ID",         width: "20%" },
  { field: "feeReceiptNumber",  header: "Fee Receipt No.",  width: "13%" },
  { field: "referenceNo",       header: "Reference No.",    width: "13%" },
  { field: "amount",            header: "Amount",           width: "8%"  },
  { field: "paidDate",          header: "Paid Date",        width: "10%" },
  { field: "feeReceipt",        header: "Download",         width: "8%", body: receiptBodyTemplate },
];

function mapToRows(list: any[]) {
  return list.map((item, index) => ({
    srNo:             String(index + 1).padStart(3, "0"),
    applicationName:  item.applicationName  ?? "—",
    orderId:          item.orderId          ?? "—",
    feeReceiptNumber: item.feeReceiptNumber ?? "—",
    referenceNo:      item.referenceNo      ?? "—",
    amount:           item.amount != null ? `₹ ${item.amount}` : "—",
    paidDate:         formatDate(item.paidDate),
    feeReceipt:       item.feeReceipt       ?? "",
  }));
}

export default function FeePaymentsPage() {
  const dispatch  = useAppDispatch();
  const rawList   = useAppSelector(selectFeePaymentList);
  const isLoading = useAppSelector(selectFeePaymentListLoading);

  const sidebar      = useDashboardSidebar();
  const sidebarOpen  = sidebar?.isOpen ?? false;
  const closeSidebar = () => sidebar?.setIsOpen(false);

  useEffect(() => {
    dispatch(fetchFeePaymentListData());
  }, [dispatch]);

  const tableData = mapToRows(rawList);

  return (
    <div className="prts-pharmacy-dashboard prts-pharmacy-scope">
      <div className="prts-dashboard-wrapper">
        <div
          className={`prts-sidebar-overlay ${sidebarOpen ? "prts-sidebar-overlay--visible" : ""}`}
          onClick={closeSidebar}
        />

        <PrtsDashboardSidebar isOpen={sidebarOpen} />

        <main className="prts-dashboard-main">
          <PrtsPageTable
            pageTitle="Fee Payments"
            tableTitle="Fee payments list"
            data={tableData}
            columns={COLUMNS}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  );
}
