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

const NationalDashboard = () => {
  const router = useRouter();
  
  // States
  const [selectedState, setSelectedState] = useState<string>('all');
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>([
    new Date(2024, 4, 1),
    new Date(2024, 4, 20)
  ]);
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
      maintainAspectRatio: false
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
      maintainAspectRatio: false
    });
  }, []);

  const handleStateChange = (e: any) => {
    const stateId = e.value;
    setSelectedState(stateId);
    if (stateId !== 'all') {
      router.push(`/super-admin/state-council/${stateId}`);
    }
  };

  const handleRowClick = (e: any) => {
    const stateId = e.data.stateId;
    router.push(`/super-admin/state-council/${stateId}`);
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
        
        <div className="flex flex-wrap align-items-center gap-3">
          {/* State Selector */}
          <div className="flex flex-column gap-1">
            <span className="text-xs font-semibold text-600">State / UT Filter</span>
            <Dropdown
              value={selectedState}
              options={statesData}
              optionLabel="name"
              optionValue="id"
              onChange={handleStateChange}
              placeholder="All States"
              className="w-full md:w-15rem"
              filter
              style={{ borderRadius: '8px' }}
            />
          </div>
          
          {/* Date Picker */}
          <div className="flex flex-column gap-1">
            <span className="text-xs font-semibold text-600">Date Range</span>
            <Calendar
              value={dates}
              onChange={(e) => setDates(e.value as Nullable<(Date | null)[]>)}
              selectionMode="range"
              readOnlyInput
              dateFormat="dd M y"
              placeholder="Select Date Range"
              className="w-full md:w-16rem"
              inputStyle={{ borderRadius: '8px' }}
              showIcon
            />
          </div>
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
                router.push('/super-admin/applications/state-wise/haryana');
              } else {
                router.push('/super-admin/applications/state-wise/haryana');
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
            
            {/* Simplified SVG Map of India with clickable states */}
            <div className="map-container" style={{ height: '240px' }}>
              <svg viewBox="0 0 340 380" className="w-full h-full">
                {/* Jammu & Kashmir / Ladakh */}
                <path d="M 110 20 L 150 10 L 170 50 L 140 80 L 110 50 Z" className="state-path" fill={getMapColor('jammu-kashmir')} onClick={() => router.push('/super-admin/state-council/haryana')} />
                {/* Punjab / Haryana */}
                <path d="M 100 60 L 130 65 L 140 90 L 110 95 Z" className="state-path" fill={getMapColor('haryana')} onClick={() => router.push('/super-admin/state-council/haryana')} />
                {/* Rajasthan */}
                <path d="M 60 90 L 110 95 L 120 150 L 70 140 Z" className="state-path" fill={getMapColor('rajasthan')} onClick={() => router.push('/super-admin/state-council/rajasthan')} />
                {/* Gujarat */}
                <path d="M 30 150 L 80 155 L 90 200 L 40 210 Z" className="state-path" fill={getMapColor('gujarat')} onClick={() => router.push('/super-admin/state-council/gujarat')} />
                {/* Uttar Pradesh */}
                <path d="M 140 90 L 190 100 L 210 160 L 150 140 Z" className="state-path" fill={getMapColor('uttar-pradesh')} onClick={() => router.push('/super-admin/state-council/uttar-pradesh')} />
                {/* Madhya Pradesh */}
                <path d="M 110 160 L 170 160 L 180 220 L 120 220 Z" className="state-path" fill={getMapColor('madhya-pradesh')} onClick={() => router.push('/super-admin/state-council/haryana')} />
                {/* Bihar */}
                <path d="M 210 115 L 250 120 L 245 155 L 205 150 Z" className="state-path" fill={getMapColor('bihar')} onClick={() => router.push('/super-admin/state-council/bihar')} />
                {/* Maharashtra */}
                <path d="M 90 210 L 150 220 L 140 280 L 80 270 Z" className="state-path" fill={getMapColor('maharashtra')} onClick={() => router.push('/super-admin/state-council/maharashtra')} />
                {/* Karnataka */}
                <path d="M 90 280 L 130 285 L 120 340 L 95 330 Z" className="state-path" fill={getMapColor('karnataka')} onClick={() => router.push('/super-admin/state-council/karnataka')} />
                {/* Kerala */}
                <path d="M 100 340 L 115 340 L 110 380 L 95 380 Z" className="state-path" fill={getMapColor('kerala')} onClick={() => router.push('/super-admin/state-council/haryana')} />
                {/* Tamil Nadu */}
                <path d="M 120 330 L 140 330 L 130 380 L 115 380 Z" className="state-path" fill={getMapColor('tamil-nadu')} onClick={() => router.push('/super-admin/state-council/haryana')} />
                {/* Andhra Pradesh / Telangana */}
                <path d="M 130 250 L 170 255 L 160 320 L 135 300 Z" className="state-path" fill={getMapColor('andhra-pradesh')} onClick={() => router.push('/super-admin/state-council/haryana')} />
                {/* East India / Bengal */}
                <path d="M 245 155 L 270 160 L 260 210 L 240 200 Z" className="state-path" fill={getMapColor('west-bengal')} onClick={() => router.push('/super-admin/state-council/haryana')} />
              </svg>
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

      {/* Top Performing Councils & Critical Alerts */}
      <div className="dashboard-grid" style={{ marginTop: '1.5rem' }}>
        
        {/* Top Performing Councils */}
        <div className="grid-col-6">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Top Performing Councils</h3>
              <span className="text-xs text-500 font-semibold uppercase">This Month</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700" style={{ borderCollapse: 'collapse', minWidth: '350px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                    <th className="py-2 font-semibold" style={{ width: '40px' }}>Rank</th>
                    <th className="py-2 font-semibold">Council Name</th>
                    <th className="py-2 font-semibold text-right">Approval Rate</th>
                    <th className="py-2 font-semibold text-right" style={{ paddingLeft: '1rem' }}>Avg. TAT</th>
                  </tr>
                </thead>
                <tbody>
                  {nationalStats.topPerformingCouncils.map((council: any) => (
                    <tr 
                      key={council.rank} 
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      className="hover:bg-slate-50 transition-colors"
                      onClick={() => router.push(`/super-admin/state-council/${council.stateId}`)}
                    >
                      <td className="py-3 font-bold">
                        <span 
                          className={`rank-badge rank-${council.rank}`} 
                          style={{ 
                            display: 'inline-flex',
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            backgroundColor: council.rank === 1 ? '#fef3c7' : council.rank === 2 ? '#e2e8f0' : council.rank === 3 ? '#ffedd5' : '#f1f5f9',
                            color: council.rank === 1 ? '#d97706' : council.rank === 2 ? '#475569' : council.rank === 3 ? '#ea580c' : '#64748b'
                          }}
                        >
                          {council.rank}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-900" style={{ fontSize: '0.82rem' }}>{council.name}</td>
                      <td className="py-3 text-right font-bold text-green-600">{council.approvalRate}%</td>
                      <td className="py-3 text-right text-slate-500 font-semibold" style={{ paddingLeft: '1rem' }}>{council.tat} Days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="grid-col-6">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Critical Alerts</h3>
              <span className="text-xs text-500 font-semibold hover:underline cursor-pointer">View All</span>
            </div>
            <div className="alerts-list">
              {nationalStats.criticalAlerts.map((alert) => (
                <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                  <div className="alert-content">
                    <i className={getAlertIcon(alert.severity)} />
                    <span>{alert.title}</span>
                  </div>
                  <div className="alert-count">
                    {alert.count.toLocaleString()}
                  </div>
                </div>
              ))}
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
            <span className="p-input-icon-left w-full md:w-15rem">
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
                style={{ borderRadius: '8px' }}
              />
            </span>
          </div>

          <DataTable
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

