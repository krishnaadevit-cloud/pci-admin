'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Nullable } from 'primereact/ts-helpers';

const RevenueAnalytics = () => {
  const router = useRouter();
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>([
    new Date(2024, 4, 1),
    new Date(2024, 4, 20)
  ]);

  const [revData, setRevData] = useState<any>({});
  const [revOptions, setRevOptions] = useState<any>({});

  const stateRevenue = [
    { rank: 1, state: 'Uttar Pradesh', amount: 4515000, txns: 12500, status: 'Audited' },
    { rank: 2, state: 'Maharashtra', amount: 3890000, txns: 10400, status: 'Audited' },
    { rank: 3, state: 'Karnataka', amount: 3120000, txns: 8400, status: 'Audited' },
    { rank: 4, state: 'Gujarat', amount: 2680000, txns: 7100, status: 'Pending Audit' },
    { rank: 5, state: 'Haryana', amount: 1845000, txns: 4800, status: 'Audited' },
    { rank: 6, state: 'Kerala', amount: 1540000, txns: 3900, status: 'Audited' },
    { rank: 7, state: 'Rajasthan', amount: 1210000, txns: 3200, status: 'Pending Audit' }
  ];

  useEffect(() => {
    setRevData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue (in Lakhs ₹)',
          backgroundColor: '#3b82f6',
          borderColor: '#3b82f6',
          data: [42.5, 48.2, 55.4, 61.8, 72.5, 88.0]
        }
      ]
    });

    setRevOptions({
      plugins: {
        legend: { display: false }
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
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/super-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Reports & Analytics</span>
        <span>/</span>
        <span className="font-semibold text-700">Revenue Analytics</span>
      </div>

      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">Revenue & Fee Ledger Analytics</h2>
          <p className="header-subtitle">Consolidated revenue auditing, fee ledger distributions, and transaction volumes across State Councils</p>
        </div>

        <div className="flex align-items-center gap-2">
          <Calendar
            value={dates}
            onChange={(e) => setDates(e.value as Nullable<(Date | null)[]>)}
            selectionMode="range"
            readOnlyInput
            dateFormat="dd M y"
            className="w-full md:w-16rem text-sm"
            inputStyle={{ borderRadius: '8px' }}
            showIcon
          />
          <Button icon="pi pi-file-pdf" label="Export Ledger" className="p-button-danger p-button-outlined p-button-sm" style={{ borderRadius: '8px' }} />
        </div>
      </div>

      <div className="grid gap-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #10b981', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Total Revenue Collected</span>
          <span className="text-2xl font-bold text-green-600 mt-1 block">₹ 1,88,00,000</span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #3b82f6', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Paid Transactions</span>
          <span className="text-2xl font-bold text-900 mt-1 block">50,300</span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #f59e0b', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Pending Ledger Amount</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">₹ 12,40,000</span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #ef4444', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Refunded / Reversals</span>
          <span className="text-2xl font-bold text-red-600 mt-1 block">₹ 1,85,000</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="grid-col-6">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Monthly Collections (in Lakhs ₹)</h3>
            </div>
            <div style={{ height: '280px', position: 'relative' }}>
              {revData.labels && <Chart type="bar" data={revData} options={revOptions} style={{ height: '100%' }} />}
            </div>
          </div>
        </div>

        <div className="grid-col-6">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>State-wise Revenue Distributions</h3>
            </div>
            <DataTable
              value={stateRevenue}
              className="p-datatable-sm"
              responsiveLayout="scroll"
              rows={5}
            >
              <Column field="rank" header="Rank" style={{ width: '50px' }} />
              <Column field="state" header="State Council" style={{ fontWeight: 600 }} />
              <Column field="amount" header="Total Fee Amount" body={(row) => `₹ ${row.amount.toLocaleString()}`} />
              <Column field="txns" header="Total Transactions" body={(row) => row.txns.toLocaleString()} />
              <Column field="status" header="Audit Status" />
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;
