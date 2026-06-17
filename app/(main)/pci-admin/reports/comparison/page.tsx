'use client';

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { LayoutContext } from '@/layout/context/layoutcontext';

const StateComparison = () => {
  const router = useRouter();
  const { globalFilterState, layoutConfig } = useContext(LayoutContext);
  const activeStateId = globalFilterState?.stateId || 'all';

  const [compData, setCompData] = useState<any>({});
  const [compOptions, setCompOptions] = useState<any>({});

  const comparisonTable = [
    { stateId: 'haryana', state: 'Haryana', volume: 12450, pending: 1240, approvalRate: 92, tat: 3.2, revenue: 1845000 },
    { stateId: 'uttar-pradesh', state: 'Uttar Pradesh', volume: 30100, pending: 6450, approvalRate: 81, tat: 6.8, revenue: 4515000 },
    { stateId: 'maharashtra', state: 'Maharashtra', volume: 23450, pending: 3120, approvalRate: 89, tat: 3.8, revenue: 3890000 },
    { stateId: 'bihar', state: 'Bihar', volume: 18000, pending: 4250, approvalRate: 74, tat: 7.2, revenue: 1100000 },
    { stateId: 'rajasthan', state: 'Rajasthan', volume: 16200, pending: 2150, approvalRate: 83, tat: 5.1, revenue: 1210000 },
    { stateId: 'gujarat', state: 'Gujarat', volume: 11300, pending: 900, approvalRate: 88, tat: 4.3, revenue: 2680000 }
  ];

  const themeColor = useMemo(() => {
    return layoutConfig.themeColor || '#10b981';
  }, [layoutConfig.themeColor]);

  useEffect(() => {
    // We can highlight the selected state in the chart by changing its bar color dynamically
    const statesList = ['Haryana', 'Uttar Pradesh', 'Maharashtra', 'Bihar', 'Rajasthan', 'Gujarat'];
    
    const approvalColors = statesList.map(st => {
      const isSelected = activeStateId !== 'all' && st.toLowerCase().replace(/\s+/g, '-') === activeStateId;
      return isSelected ? themeColor : '#cbd5e1'; // Highlight active state, others are slate/gray
    });

    const tatColors = statesList.map(st => {
      const isSelected = activeStateId !== 'all' && st.toLowerCase().replace(/\s+/g, '-') === activeStateId;
      return isSelected ? '#f59e0b' : '#e2e8f0';
    });

    setCompData({
      labels: statesList,
      datasets: [
        {
          label: 'Approval Rate (%)',
          backgroundColor: activeStateId === 'all' ? '#10b981' : approvalColors,
          barThickness: 16,
          maxBarThickness: 24,
          borderRadius: 4,
          data: [92, 81, 89, 74, 83, 88]
        },
        {
          label: 'Avg TAT (Days x 10)',
          backgroundColor: activeStateId === 'all' ? '#f59e0b' : tatColors,
          barThickness: 16,
          maxBarThickness: 24,
          borderRadius: 4,
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
  }, [activeStateId, themeColor]);

  // Highlight the row if it matches the globally selected state council
  const rowClassName = (data: any) => {
    const isSelected = activeStateId !== 'all' && data.stateId === activeStateId;
    return isSelected ? 'bg-blue-50 font-bold border-left-4 border-blue-500' : '';
  };

  return (
    <div className="super-admin-dashboard">
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Reports & Analytics</span>
        <span>/</span>
        <span className="font-semibold text-700">State Comparison</span>
      </div>

      <div className="fal-page-header">
        <div className="fal-page-header__inner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="fal-page-header__icon-wrap">
              <i className="pi pi-chart-line" />
            </div>
            <div className="fal-page-header__text">
              <h1 className="fal-page-header__title">State Performance Comparison</h1>
              <p className="fal-page-header__subtitle">Compare application processing efficiency, turnaround times, and metrics side-by-side across councils</p>
            </div>
          </div>
          <div className="flex align-items-center gap-2">
            <Button icon="pi pi-file-excel" label="Export Comparison Sheet" className="p-button-success p-button-outlined p-button-sm" style={{ borderRadius: '8px' }} />
          </div>
        </div>
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
              <h3>Consolidated Metrics Comparison {activeStateId !== 'all' && `(Highlighting ${activeStateId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')})`}</h3>
            </div>
            <DataTable
              value={comparisonTable}
              showGridlines 
              className="p-datatable-striped"
              responsiveLayout="scroll"
              rowClassName={rowClassName}
            >
              <Column field="state" header="State Council Name" sortable style={{ fontWeight: 600 }} />
              <Column field="volume" header="Total Application Volume" sortable body={(row) => row.volume.toLocaleString()} />
              <Column field="pending" header="Current Pending" sortable body={(row) => row.pending.toLocaleString()} />
              <Column field="approvalRate" header="Approval Rate %" sortable body={(row) => `${row.approvalRate}%`} />
              <Column field="tat" header="Avg TAT (Days)" sortable body={(row) => `${row.tat} Days`} />
              <Column field="revenue" header="Total Fee Revenue" sortable body={(row) => `₹ ${row.revenue.toLocaleString()}`} />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateComparison;
