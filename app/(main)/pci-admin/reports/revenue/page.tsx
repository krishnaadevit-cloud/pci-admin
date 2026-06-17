'use client';

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { LayoutContext } from '@/layout/context/layoutcontext';

// Safe JSON importer wrapper that handles environment-specific ES module wrappers and literal JSON key structures
function safeJson(raw: any) {
  if (!raw) return raw;
  if (typeof raw === 'object' && raw.default !== undefined) {
    const keys = Object.keys(raw);
    const hasOtherKeys = keys.some(k => k !== 'default' && k !== '__esModule');
    if (!hasOtherKeys) {
      return raw.default;
    }
  }
  return raw;
}

// Load mock data
import stateStatsMapRaw from "@/jsondata/state-stats.json";
const stateStatsMap = safeJson(stateStatsMapRaw);

type StateDataKey = keyof typeof stateStatsMap;

const RevenueAnalytics = () => {
  const router = useRouter();
  const { globalFilterState, layoutConfig } = useContext(LayoutContext);
  const stateId = globalFilterState?.stateId || 'all';
  const isStateLevel = stateId !== 'all';

  const [revData, setRevData] = useState<any>({});
  const [revOptions, setRevOptions] = useState<any>({});

  // Resolve state stats
  const activeStats = useMemo(() => {
    if (stateId === 'all') {
      return {
        stateName: 'All India (National)',
        totalRevenue: '₹ 1,88,00,000',
        paidTransactions: '50,300',
        pendingLedger: '₹ 12,40,000',
        refunded: '₹ 1,85,000',
        chartData: [42.5, 48.2, 55.4, 61.8, 72.5, 88.0]
      };
    } else {
      const stats = (stateStatsMap && (stateStatsMap[stateId as StateDataKey] || stateStatsMap['default'])) || {
        stateName: 'State Pharmacy Council',
        summaryCards: []
      };

      const revenueCard = stats.summaryCards.find((c: any) => c.id === 'revenue');
      const approvedCard = stats.summaryCards.find((c: any) => c.id === 'approved');
      const pendingCard = stats.summaryCards.find((c: any) => c.id === 'pending');
      const rejectedCard = stats.summaryCards.find((c: any) => c.id === 'rejected');

      const revVal = revenueCard ? revenueCard.value : '₹ 0';
      const approvedVal = approvedCard ? approvedCard.value : '0';
      const pendingVal = pendingCard ? pendingCard.value : '0';
      const rejectedVal = rejectedCard ? rejectedCard.value : '0';

      const revInt = parseInt(revVal.replace(/[^\d]/g, ''), 10) || 0;
      const pendingInt = parseInt(pendingVal.replace(/[^\d]/g, ''), 10) || 0;
      const rejectedInt = parseInt(rejectedVal.replace(/[^\d]/g, ''), 10) || 0;

      const pendingLedger = `₹ ${(pendingInt * 1500).toLocaleString()}`;
      const refunded = `₹ ${(rejectedInt * 350).toLocaleString()}`;

      // Mock trend based on state revenue
      const base = revInt / 100000; // in Lakhs
      const chartData = [
        (base * 0.1).toFixed(1),
        (base * 0.15).toFixed(1),
        (base * 0.2).toFixed(1),
        (base * 0.22).toFixed(1),
        (base * 0.28).toFixed(1),
        (base * 0.35).toFixed(1)
      ].map(Number);

      return {
        stateName: stats.stateName,
        totalRevenue: revVal,
        paidTransactions: approvedVal,
        pendingLedger,
        refunded,
        chartData
      };
    }
  }, [stateId]);

  const stateRevenue = [
    { rank: 1, state: 'Uttar Pradesh', amount: 4515000, txns: 12500, status: 'Audited' },
    { rank: 2, state: 'Maharashtra', amount: 3890000, txns: 10400, status: 'Audited' },
    { rank: 3, state: 'Karnataka', amount: 3120000, txns: 8400, status: 'Audited' },
    { rank: 4, state: 'Gujarat', amount: 2680000, txns: 7100, status: 'Pending Audit' },
    { rank: 5, state: 'Haryana', amount: 1845000, txns: 4800, status: 'Audited' },
    { rank: 6, state: 'Kerala', amount: 1540000, txns: 3900, status: 'Audited' },
    { rank: 7, state: 'Rajasthan', amount: 1210000, txns: 3200, status: 'Pending Audit' }
  ];

  const districtRevenue = [
    { rank: 1, district: 'Central District', amount: 450000, txns: 1250, status: 'Audited' },
    { rank: 2, district: 'North District', amount: 380000, txns: 1040, status: 'Audited' },
    { rank: 3, district: 'South District', amount: 310000, txns: 840, status: 'Audited' },
    { rank: 4, district: 'East District', amount: 260000, txns: 710, status: 'Pending Audit' },
    { rank: 5, district: 'West District', amount: 180000, txns: 480, status: 'Audited' }
  ];

  const themeColor = useMemo(() => {
    return layoutConfig.themeColor || '#3b82f6';
  }, [layoutConfig.themeColor]);

  useEffect(() => {
    setRevData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue (in Lakhs ₹)',
          backgroundColor: themeColor,
          borderColor: themeColor,
          barThickness: 20,
          maxBarThickness: 28,
          borderRadius: 6,
          data: activeStats.chartData
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
  }, [activeStats, themeColor]);

  return (
    <div className="super-admin-dashboard">
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Reports & Analytics</span>
        <span>/</span>
        <span className="font-semibold text-700">Revenue Analytics</span>
      </div>

      <div className="fal-page-header">
        <div className="fal-page-header__inner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="fal-page-header__icon-wrap">
              <i className="pi pi-indian-rupee" />
            </div>
            <div className="fal-page-header__text">
              <h1 className="fal-page-header__title">
                {isStateLevel ? `District-wise Revenue & Fee Ledger` : `Revenue & Fee Ledger Analytics`} - {activeStats.stateName}
              </h1>
              <p className="fal-page-header__subtitle">
                Consolidated revenue auditing, fee ledger distributions, and transaction volumes {isStateLevel ? 'across districts.' : 'across State Councils.'}
              </p>
            </div>
          </div>

          <div className="flex align-items-center gap-2">
            <Button icon="pi pi-file-pdf" label="Export Ledger" className="p-button-danger p-button-outlined p-button-sm" style={{ borderRadius: '8px' }} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stats-card card-green p-3">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="text-sm font-semibold text-600 block mb-1">Total Revenue Collected</span>
              <h2 className="text-3xl font-bold text-900 m-0">{activeStats.totalRevenue}</h2>
              <span className="text-xs text-primary font-medium block mt-2">Audited registry revenue</span>
            </div>
            <div className="card-icon green">
              <i className="pi pi-indian-rupee" />
            </div>
          </div>
        </div>

        <div className="stats-card card-blue p-3">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="text-sm font-semibold text-600 block mb-1">Paid Transactions</span>
              <h2 className="text-3xl font-bold text-900 m-0">{activeStats.paidTransactions}</h2>
              <span className="text-xs text-primary font-medium block mt-2">Processed clear entries</span>
            </div>
            <div className="card-icon blue">
              <i className="pi pi-check-circle" />
            </div>
          </div>
        </div>

        <div className="stats-card card-orange p-3">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="text-sm font-semibold text-600 block mb-1">Pending Ledger Amount</span>
              <h2 className="text-3xl font-bold text-900 m-0">{activeStats.pendingLedger}</h2>
              <span className="text-xs text-primary font-medium block mt-2">Awaiting verification</span>
            </div>
            <div className="card-icon orange">
              <i className="pi pi-clock" />
            </div>
          </div>
        </div>

        <div className="stats-card card-red p-3">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="text-sm font-semibold text-600 block mb-1">Refunded / Reversals</span>
              <h2 className="text-3xl font-bold text-900 m-0">{activeStats.refunded}</h2>
              <span className="text-xs text-primary font-medium block mt-2">Reversals and refunds</span>
            </div>
            <div className="card-icon red">
              <i className="pi pi-history" />
            </div>
          </div>
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
              <h3>{isStateLevel ? 'District-wise Revenue Distributions' : 'State-wise Revenue Distributions'}</h3>
            </div>
            <DataTable
              value={isStateLevel ? districtRevenue : stateRevenue}
              className="p-datatable-sm"
              showGridlines 
              responsiveLayout="scroll"
              rows={5}
            >
              <Column field="rank" header="Rank" style={{ width: '50px' }} />
              <Column field={isStateLevel ? "district" : "state"} header={isStateLevel ? "District Name" : "State Council"} style={{ fontWeight: 600 }} />
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
