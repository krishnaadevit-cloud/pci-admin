"use client";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ReactNode } from "react";
import { SkeletonbodyTemplate, Skeletonitems } from "@/appConfig/Settings";

export type DataTableSkeletonColumn = {
  field: string;
  header: string;
};

type DataTableSkeletonProps = {
  columns: DataTableSkeletonColumn[];
  rows?: number;
  showGridlines?: boolean;
  className?: string;
  header?: ReactNode;
};

/**
 * Loading placeholder DataTable — pill-bar skeleton rows with horizontal dividers only.
 */
export function DataTableSkeleton({
  columns,
  rows = 10,
  showGridlines = true,
  className = "",
  header,
}: DataTableSkeletonProps) {
  const items =
    rows === 10
      ? Skeletonitems
      : Array.from({ length: rows }, (_, i) => ({ id: i }));

  return (
    <DataTable
      value={items}
      showGridlines={showGridlines}
      className={`p-datatable-skeleton ${className}`.trim()}
      header={header}
    >
      {columns.map((col) => (
        <Column
          key={col.field}
          field={col.field}
          header={col.header}
          body={SkeletonbodyTemplate}
        />
      ))}
    </DataTable>
  );
}
