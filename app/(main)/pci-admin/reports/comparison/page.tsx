'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const StateComparison = () => {
  const router = useRouter();

  const [compData, setCompData] = useState<any>({});
  const [compOptions, setCompOptions] = useState<any>({});

  const comparisonTable = [
    { state: 'Haryana', volume: 12450, pending: 1240, approvalRate: 92, tat: 3.2, revenue: 1845000 },
    { state: 'Uttar Pradesh', volume: 30100, pending: 6450, approvalRate: 81, tat: 6.8, revenue: 4515000 },
    { state: 'Maharashtra', volume: 23450, pending: 3120, approvalRate: 89, tat: 3.8, revenue: 3890000 },
    { state: 'Bihar', volume: 18000, pending: 4250, approvalRate: 74, tat: 7.2, revenue: 1100000 },
    { state: 'Rajasthan', volume: 16200, pending: 2150, approvalRate: 83, tat: 5.1, revenue: 1210000 },
    { state: 'Gujarat', volume: 11300, pending: 900, approvalRate: 88, tat: 4.3, revenue: 2680000 }
  ];

  useEffect(() => {
    setCompData({
      labels: ['Haryana', 'Uttar Pradesh', 'Maharashtra', 'Bihar', 'Rajasthan', 'Gujarat'],
      datasets: [
        {
          label: 'Approval Rate (%)',
          backgroundColor: '#10b981',
          data: [92, 81, 89, 74, 83, 88]
        },
        {
          label: 'Avg TAT (Days x 10)',
          backgroundColor: '#f59e0b',
          data: [32, 68, 38, 72, 51, 43] // TAT multiplied by 10 for visibility on chart
        }
      ]
    });

    setCompOptions({
      plugins: {
        legend: { display: true, position: 'bottom' }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b' } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } }
      },
      maintainAspectRatio: false
    });
  }, []);

  return (
    <div className="super-admin-dashboard">
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Reports & Analytics</span>
        <span>/</span>
        <span className="font-semibold text-700">State Comparison</span>
      </div>

      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">State Performance Comparison</h2>
          <p className="header-subtitle">Compare application processing efficiency, turnaround times, and metrics side-by-side across councils</p>
        </div>

        <Button icon="pi pi-file-excel" label="Export Comparison Sheet" className="p-button-success p-button-outlined p-button-sm" style={{ borderRadius: '8px' }} />
      </div>

      <div className="dashboard-grid">
        <div className="grid-col-12">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Approval Rates & processing Efficiency Chart</h3>
            </div>
            <div style={{ height: '300px', position: 'relative' }}>
              {compData.labels && <Chart type="bar" data={compData} options={compOptions} style={{ height: '100%' }} />}
            </div>
          </div>
        </div>

        <div className="grid-col-12" style={{ marginTop: '1.5rem' }}>
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Consolidated Metrics Comparison</h3>
            </div>
            <DataTable
              value={comparisonTable}
              className="p-datatable-striped"
              responsiveLayout="scroll"
            >
              <Column field="state" header="State Council Name" sortable style={{ fontWeight: 600 }} />
              <Column field="volume" header="Total Application Volume" sortable body={(row) => row.volume.toLocaleString()} />
              <Column field="pending" header="Current Pending" sortable body={(row) => row.pending.toLocaleString()} />
              <Column field="approvalRate" header="Approval Rate %" sortable body={(row) => `${row.approvalRate}%`} />
              <Column field="tat" header="Avg TAT (Days)" sortable body={(row) => `${row.tat} Days`} />
              <Column field="revenue" header="Revenue Audited" sortable body={(row) => `₹ ${row.revenue.toLocaleString()}`} />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateComparison;
