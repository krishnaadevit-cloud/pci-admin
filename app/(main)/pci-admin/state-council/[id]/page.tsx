'use client';

import React, { useState, useEffect, memo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Nullable } from 'primereact/ts-helpers';

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
import statesDataRaw from '@/jsondata/states.json';
import stateStatsMapRaw from '@/jsondata/state-stats.json';

const statesData = safeJson(statesDataRaw);
const stateStatsMap = safeJson(stateStatsMapRaw);

type StateDataKey = keyof typeof stateStatsMap;

const StateCouncilDashboard = () => {
  const router = useRouter();
  const params = useParams();
  const stateId = (params?.id as string) || 'haryana';
  
  // Select data based on stateId or fallback to default
  const stateData = (stateStatsMap && (stateStatsMap[stateId as StateDataKey] || stateStatsMap['default'])) || {
    stateName: 'State Pharmacy Council',
    summaryCards: [],
    applicationTypeDistribution: [],
    monthlyTrend: { labels: [], data: [] },
    recentApplications: []
  };

  // Chart configs
  const [typeDistributionData, setTypeDistributionData] = useState<any>({});
  const [typeDistributionOptions, setTypeDistributionOptions] = useState<any>({});
  
  const [trendData, setTrendData] = useState<any>({});
  const [trendOptions, setTrendOptions] = useState<any>({});
  useEffect(() => {
    // 1. Application Type Distribution Chart (Doughnut)
    const typeColors = ['#0F8BFD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];
    setTypeDistributionData({
      labels: stateData.applicationTypeDistribution.map(item => item.label),
      datasets: [
        {
          data: stateData.applicationTypeDistribution.map(item => item.value),
          backgroundColor: typeColors,
          hoverBackgroundColor: typeColors.map(color => color + 'dd')
        }
      ]
    });

    setTypeDistributionOptions({
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            boxWidth: 10,
            font: { size: 9.5 },
            color: '#475569'
          }
        }
      },
      cutout: '60%',
      maintainAspectRatio: false,
      onClick: (event: any, elements: any, chart: any) => {
        if (elements && elements.length > 0) {
          const index = elements[0].index;
          const label = chart.data.labels[index];
          router.push(`/pci-admin/applications/state-wise/${stateId}?type=${encodeURIComponent(label)}`);
        }
      }
    });

    // 2. Monthly Trend Chart (Line)
    setTrendData({
      labels: stateData.monthlyTrend.labels,
      datasets: [
        {
          label: 'Applications Received',
          data: stateData.monthlyTrend.data,
          fill: true,
          borderColor: '#0F8BFD',
          tension: 0.4,
          backgroundColor: 'rgba(15, 139, 253, 0.1)',
          pointBackgroundColor: '#0F8BFD',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#0F8BFD'
        }
      ]
    });

    setTrendOptions({
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          grid: {
            color: '#f1f5f9'
          },
          ticks: {
            color: '#64748b'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b'
          }
        }
      },
      maintainAspectRatio: false
    });
  }, [stateId, stateData]);



  // Status badges helper
  const getStatusSeverity = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div className="super-admin-dashboard">
      
      {/* Breadcrumb Info */}
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">State Councils</span>
        <span>/</span>
        <span className="font-semibold text-700">{stateData.stateName}</span>
      </div>

      <div className="fal-page-header">
        <div className="fal-page-header__inner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="fal-page-header__icon-wrap">
              <i className="pi pi-users" />
            </div>
            <div className="fal-page-header__text">
              <h1 className="fal-page-header__title">{stateData.stateName}</h1>
              <p className="fal-page-header__subtitle">State Council Oversight Dashboard & Analytics</p>
            </div>
          </div>
          <div className="fal-page-header__meta">
            <span className="fal-page-header__badge">
              <i className="pi pi-globe" />
              State Council
            </span>
          </div>
        </div>
      </div>

      {/* Local Council Metrics Cards */}
      <div className="grid gap-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {stateData.summaryCards.map((card) => (
          <div 
            key={card.id} 
            className={`stats-card card-${card.color} p-3`}
            onClick={() => {
              if (card.id === 'applications') {
                router.push(`/pci-admin/applications/state-wise/${stateId}`);
              } else if (card.id === 'pending') {
                router.push(`/pci-admin/applications/state-wise/${stateId}?status=Pending`);
              } else if (card.id === 'approved') {
                router.push(`/pci-admin/applications/state-wise/${stateId}?status=Approved`);
              } else if (card.id === 'rejected') {
                router.push(`/pci-admin/applications/state-wise/${stateId}?status=Rejected`);
              }
            }}
          >
            <div className="flex justify-content-between align-items-center">
              <div>
                <span className="text-xs font-semibold text-600 block mb-1">{card.title}</span>
                <h2 className="text-2xl font-bold text-900 m-0">{card.value}</h2>
                <span className="text-xs text-primary font-medium hover:underline block mt-2 cursor-pointer">
                  {card.subText} →
                </span>
              </div>
              <div className={`card-icon ${card.color}`} style={{ width: '40px', height: '40px', fontSize: '1.1rem' }}>
                <i className={card.icon} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Charts */}
      <div className="dashboard-grid">
        
        {/* Application Type Distribution */}
        <div className="grid-col-6">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Application Type Distribution</h3>
            </div>
            <div style={{ height: '230px', position: 'relative' }}>
              {typeDistributionData.labels && (
                <Chart type="doughnut" data={typeDistributionData} options={typeDistributionOptions} style={{ height: '100%' }} />
              )}
            </div>
          </div>
        </div>

        {/* Monthly Application Trend */}
        <div className="grid-col-6">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Monthly Application Trend</h3>
            </div>
            <div style={{ height: '230px', position: 'relative' }}>
              {trendData.labels && (
                <Chart type="line" data={trendData} options={trendOptions} style={{ height: '100%' }} />
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Recent Applications and Quick Actions */}
      <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
        
        {/* Recent Applications */}
        <div className="grid-col-8">
          <div className="dashboard-panel">
            <div className="panel-header flex justify-content-between align-items-center">
              <h3>Recent Applications</h3>
              <Button 
                label="View All" 
                icon="pi pi-angle-right" 
                iconPos="right" 
                className="p-button-text p-button-sm text-sm" 
                onClick={() => router.push(`/pci-admin/applications/state-wise/${stateId}`)}
              />
            </div>

            <DataTable
              showGridlines
              value={stateData.recentApplications}
            
              className="p-datatable-sm"
              responsiveLayout="scroll"
            >
              <Column field="appNo" header="Application No." sortable style={{ fontWeight: 600 }} />
              <Column field="applicantName" header="Applicant Name" />
              <Column field="appType" header="Application Type" />
              <Column field="submittedOn" header="Submitted On" />
              <Column 
                field="status" 
                header="Status" 
                body={(row) => {
                  const statusLower = row.status.toLowerCase();
                  const statusClass = 
                    statusLower === "approved" ? "fal-status--approved" :
                    statusLower === "pending" ? "fal-status--pending" :
                    statusLower === "rejected" ? "fal-status--rejected" :
                    "fal-status--in_review";
                  return (
                    <span className={`fal-status ${statusClass}`}>
                      {row.status}
                    </span>
                  );
                }} 
              />
            </DataTable>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid-col-4">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Quick Actions</h3>
            </div>
            
            <div className="flex flex-column gap-3">
              <Button 
                label="View Applications List" 
                icon="pi pi-list" 
                className="p-button-outlined w-full justify-content-start text-left py-3 text-sm" 
                style={{ borderRadius: '8px' }}
                onClick={() => router.push(`/pci-admin/applications/state-wise/${stateId}`)}
              />
              <Button 
                label="Monitor Pending Scrutiny" 
                icon="pi pi-search" 
                className="p-button-outlined p-button-warning w-full justify-content-start text-left py-3 text-sm" 
                style={{ borderRadius: '8px' }}
              />
              <Button 
                label="Generate Analytics Reports" 
                icon="pi pi-file-excel" 
                className="p-button-outlined p-button-success w-full justify-content-start text-left py-3 text-sm" 
                style={{ borderRadius: '8px' }}
              />
              <Button 
                label="Certificates Registry" 
                icon="pi pi-verified" 
                className="p-button-outlined p-button-secondary w-full justify-content-start text-left py-3 text-sm" 
                style={{ borderRadius: '8px' }}
              />
              <Button 
                label="Revenue & Audit Ledger" 
                icon="pi pi-wallet" 
                className="p-button-outlined p-button-info w-full justify-content-start text-left py-3 text-sm" 
                style={{ borderRadius: '8px' }}
              />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default memo(StateCouncilDashboard);

