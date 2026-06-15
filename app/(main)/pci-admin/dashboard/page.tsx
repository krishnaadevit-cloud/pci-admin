'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Nullable } from 'primereact/ts-helpers';
import { FilterMatchMode } from 'primereact/api';

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
import nationalStatsRaw from '@/jsondata/national-stats.json';

const statesData = safeJson(statesDataRaw);
const nationalStats = safeJson(nationalStatsRaw);

import IndiaMap from './IndiaMap';

const NationalDashboard = () => {
  const router = useRouter();
  
  // States
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  
  // Chart configurations
  const [appStatsData, setAppStatsData] = useState<any>({});
  const [appStatsOptions, setAppStatsOptions] = useState<any>({});
  
  const [statusOverviewData, setStatusOverviewData] = useState<any>({});
  const [statusOverviewOptions, setStatusOverviewOptions] = useState<any>({});

  useEffect(() => {
    // 1. Application Statistics Chart (Doughnut)
    const statsColors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
      '#EC4899', '#06B6D4', '#14B8A6', '#6366F1', '#F43F5E', '#64748B'
    ];
    
    setAppStatsData({
      labels: nationalStats.applicationStatistics.map(item => item.label),
      datasets: [
        {
          data: nationalStats.applicationStatistics.map(item => item.value),
          backgroundColor: statsColors,
          hoverBackgroundColor: statsColors.map(color => color + 'dd')
        }
      ]
    });

    setAppStatsOptions({
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            boxWidth: 12,
            font: { size: 10 },
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
          router.push(`/pci-admin/applications/state-wise/all?type=${encodeURIComponent(label)}`);
        }
      }
    });

    // 2. Application Status Overview Chart (Doughnut)
    setStatusOverviewData({
      labels: nationalStats.applicationStatusOverview.map(item => item.status),
      datasets: [
        {
          data: nationalStats.applicationStatusOverview.map(item => item.value),
          backgroundColor: nationalStats.applicationStatusOverview.map(item => item.color),
          hoverBackgroundColor: nationalStats.applicationStatusOverview.map(item => item.color + 'dd')
        }
      ]
    });

    setStatusOverviewOptions({
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            boxWidth: 12,
            font: { size: 11 },
            color: '#475569'
          }
        }
      },
      cutout: '65%',
      maintainAspectRatio: false,
      onClick: (event: any, elements: any, chart: any) => {
        if (elements && elements.length > 0) {
          const index = elements[0].index;
          const label = chart.data.labels[index];
          router.push(`/pci-admin/applications/state-wise/all?status=${encodeURIComponent(label)}`);
        }
      }
    });
  }, []);


  const handleRowClick = (e: any) => {
    const stateId = e.data.stateId;
    router.push(`/pci-admin/state-council/${stateId}`);
  };

  // Helper for rendering alerts icons
  const getAlertIcon = (severity: string) => {
    switch(severity) {
      case 'high': return 'pi pi-exclamation-triangle alert-icon';
      case 'medium': return 'pi pi-info-circle alert-icon';
      default: return 'pi pi-bell alert-icon';
    }
  };

  // Mock colors for pharmacist map legend
  const getMapColor = (stateId: string) => {
    const match = nationalStats.statewisePharmacistsDistribution.find(s => s.stateId === stateId);
    if (!match) return '#E2E8F0'; // Default light gray
    
    if (match.count > 200000) return '#1E3A8A'; // >2,00,000
    if (match.count >= 100000) return '#3B82F6'; // 1,00,000 - 2,00,000
    if (match.count >= 50000) return '#93C5FD'; // 50,000 - 1,00,000
    if (match.count >= 10000) return '#DBEAFE'; // 10,000 - 50,000
    return '#EFF6FF'; // <10,000
  };

  return (
    <div className="super-admin-dashboard">
      
      {/* Header & Filters */}
      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">National Dashboard</h2>
          <p className="header-subtitle">Pharmacy Council of India (PCI) • Super Admin Control Center</p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {nationalStats.summaryCards.map((card) => (
          <div 
            key={card.id} 
            className={`stats-card card-${card.color} p-3`}
            onClick={() => {
              if (card.id === 'states') {
                const el = document.getElementById('state-summary-table');
                el?.scrollIntoView({ behavior: 'smooth' });
              } else if (card.id === 'pharmacists') {
                router.push('/pci-admin/applications/state-wise/all');
              } else if (card.id === 'pending') {
                router.push('/pci-admin/applications/state-wise/all?status=Pending');
              } else if (card.id === 'approved') {
                router.push('/pci-admin/applications/state-wise/all?status=Approved');
              } else if (card.id === 'rejected') {
                router.push('/pci-admin/applications/state-wise/all?status=Rejected');
              } else {
                router.push('/pci-admin/applications/state-wise/all');
              }
            }}
          >
            <div className="flex justify-content-between align-items-center">
              <div>
                <span className="text-sm font-semibold text-600 block mb-1">{card.title}</span>
                <h2 className="text-3xl font-bold text-900 m-0">{card.value}</h2>
                <span className="text-xs text-primary font-medium hover:underline block mt-2 cursor-pointer">
                  {card.subText} →
                </span>
              </div>
              <div className={`card-icon ${card.color}`}>
                <i className={card.icon} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Visualizations */}
      <div className="dashboard-grid">
        
        {/* Chart 1: Application Statistics */}
        <div className="grid-col-4">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Application Statistics (All India)</h3>
            </div>
            <div style={{ height: '240px', position: 'relative' }}>
              {appStatsData.labels && (
                <Chart type="doughnut" data={appStatsData} options={appStatsOptions} style={{ height: '100%' }} />
              )}
            </div>
            <div className="text-center mt-3">
              <span className="text-2xl font-bold text-900">2,54,120</span>
              <span className="text-xs text-500 block">Total Received Applications</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Application Status Overview */}
        <div className="grid-col-4">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Application Status Overview</h3>
            </div>
            <div style={{ height: '240px', position: 'relative' }}>
              {statusOverviewData.labels && (
                <Chart type="doughnut" data={statusOverviewData} options={statusOverviewOptions} style={{ height: '100%' }} />
              )}
            </div>
            <div className="text-center mt-3">
              <span className="text-2xl font-bold text-900">2,54,120</span>
              <span className="text-xs text-500 block">Total Applications Under Scope</span>
            </div>
          </div>
        </div>

        {/* Visualization 3: Pharmacist Map Distribution */}
        <div className="grid-col-4">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>State-wise Pharmacists Distribution</h3>
            </div>
            
            {/* Geographically accurate SVG Map of India with clickable states */}
            <div className="map-container" style={{ height: '240px' }}>
              <IndiaMap getMapColor={getMapColor} router={router} />
            </div>

            {/* Map Legend */}
            <div className="map-legend">
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#1E3A8A' }}></div>
                <span>&gt; 2L</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#3B82F6' }}></div>
                <span>1L - 2L</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#93C5FD' }}></div>
                <span>50k - 1L</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#DBEAFE' }}></div>
                <span>10k - 50k</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: '#EFF6FF' }}></div>
                <span>&lt; 10k</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      

      {/* State-wise Application Summary */}
      <div id="state-summary-table" style={{ marginTop: '1.5rem' }}>
        <div className="dashboard-panel">
          <div className="panel-header flex-column md:flex-row md:justify-content-between md:align-items-center gap-2">
            <div>
              <h3>State-wise Application Summary</h3>
              <p className="text-xs text-500 m-0 mt-1">Click on any row to open the specific State Council dashboard</p>
            </div>
            
            {/* Search filter */}
            <span className="p-input-icon-left   md:w-15rem">
              <i className="pi pi-search" />
              <InputText
                value={globalFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setGlobalFilter(val);
                  setFilters({
                    global: { value: val, matchMode: FilterMatchMode.CONTAINS }
                  } as any);
                }}
                placeholder="Search State..."
                className="w-full text-sm py-2"
                style={{ borderRadius: '8px', maxWidth: '250px' }}
              />
            </span>
          </div>

          <DataTable
            showGridlines
            value={nationalStats.statewiseApplicationSummary}
            filters={filters}
            onFilter={(e) => setFilters(e.filters as any)}
            globalFilterFields={['stateName']}
            onRowClick={handleRowClick}
            className="p-datatable-striped"
            style={{ cursor: 'pointer' }}
            responsiveLayout="scroll"
            rowHover
          >
            <Column field="stateName" header="State / UT" sortable style={{ fontWeight: 600 }} />
            <Column field="total" header="Total Applications" sortable body={(row) => row.total.toLocaleString()} />
            <Column field="pending" header="Pending" sortable body={(row) => <span className="text-amber-600 font-semibold">{row.pending.toLocaleString()}</span>} />
            <Column field="approved" header="Approved" sortable body={(row) => <span className="text-green-600 font-semibold">{row.approved.toLocaleString()}</span>} />
            <Column field="rejected" header="Rejected" sortable body={(row) => <span className="text-red-600 font-semibold">{row.rejected.toLocaleString()}</span>} />
            <Column field="returned" header="Returned" sortable body={(row) => <span className="text-blue-600 font-semibold">{row.returned.toLocaleString()}</span>} />
          </DataTable>
        </div>
      </div>

    </div>
  );
};

export default NationalDashboard;

