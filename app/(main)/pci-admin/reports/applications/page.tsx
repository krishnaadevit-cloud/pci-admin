'use client';

import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Nullable } from 'primereact/ts-helpers';
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
import nationalStatsRaw from "@/jsondata/national-stats.json";

const stateStatsMap = safeJson(stateStatsMapRaw);
const nationalStats = safeJson(nationalStatsRaw);

type StateDataKey = keyof typeof stateStatsMap;

const ApplicationAnalytics = () => {
  const router = useRouter();
  const { globalFilterState, layoutConfig } = useContext(LayoutContext);
  const stateId = globalFilterState?.stateId || 'all';

  const [dates, setDates] = useState<Nullable<(Date | null)[]>>([
    new Date(2024, 4, 1),
    new Date(2024, 4, 25)
  ]);

  const [serviceData, setServiceData] = useState<any>({});
  const [serviceOptions, setServiceOptions] = useState<any>({});
  
  const [tatData, setTatData] = useState<any>({});
  const [tatOptions, setTatOptions] = useState<any>({});

  // Resolve state stats
  const activeStats = useMemo(() => {
    if (stateId === 'all') {
      return {
        stateName: 'All India (National)',
        totalApplications: '2,54,120',
        approvalRate: '85.4%',
        avgTat: '11.8 Days',
        peakMonth: 'May 2024',
        typeDistribution: nationalStats.applicationStatistics.map((item: any) => ({
          label: item.label,
          value: item.value
        }))
      };
    } else {
      const stats = (stateStatsMap && (stateStatsMap[stateId as StateDataKey] || stateStatsMap['default'])) || {
        stateName: 'State Pharmacy Council',
        summaryCards: [],
        applicationTypeDistribution: []
      };

      const totalCard = stats.summaryCards.find((c: any) => c.id === 'applications');
      const approvedCard = stats.summaryCards.find((c: any) => c.id === 'approved');
      
      const total = totalCard ? parseInt(totalCard.value.replace(/,/g, ''), 10) : 100;
      const approved = approvedCard ? parseInt(approvedCard.value.replace(/,/g, ''), 10) : 80;
      const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) + '%' : '85.0%';

      // Mock TAT based on state
      const avgTat = stateId === 'haryana' ? '3.2 Days' : stateId === 'uttar-pradesh' ? '6.8 Days' : stateId === 'maharashtra' ? '3.8 Days' : '5.4 Days';

      return {
        stateName: stats.stateName,
        totalApplications: totalCard ? totalCard.value : '0',
        approvalRate,
        avgTat,
        peakMonth: 'May 2024',
        typeDistribution: stats.applicationTypeDistribution.map((item: any) => ({
          label: item.label,
          value: item.value
        }))
      };
    }
  }, [stateId]);

  // Primary Theme Color fallback
  const themeColor = useMemo(() => {
    return layoutConfig.themeColor || '#3B82F6';
  }, [layoutConfig.themeColor]);

  useEffect(() => {
    // Service distribution chart
    setServiceData({
      labels: activeStats.typeDistribution.map((item: any) => item.label),
      datasets: [
        {
          label: 'Application Count',
          backgroundColor: themeColor,
          hoverBackgroundColor: themeColor + 'dd',
          barThickness: 16,
          maxBarThickness: 24,
          borderRadius: 4,
          data: activeStats.typeDistribution.map((item: any) => item.value)
        }
      ]
    });

    setServiceOptions({
      indexAxis: 'y',
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } },
        y: { grid: { display: false }, ticks: { color: '#64748b' } }
      },
      maintainAspectRatio: false
    });

    // Turnaround Time (TAT) Trend Chart
    // Adjust mock trend dataset based on selected state council
    const tatValues = stateId === 'all' 
      ? [15.2, 14.1, 12.8, 11.5, 9.8, 8.4] 
      : stateId === 'haryana' 
      ? [5.2, 4.8, 4.1, 3.8, 3.5, 3.2] 
      : stateId === 'uttar-pradesh' 
      ? [9.8, 9.2, 8.5, 7.9, 7.2, 6.8] 
      : [8.5, 7.8, 7.1, 6.5, 5.9, 5.4];

    setTatData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Average TAT (Days)',
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          data: tatValues
        }
      ]
    });

    setTatOptions({
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#64748b' } },
        y: { grid: { color: '#f1f5f9' }, ticks: { color: '#64748b' } }
      },
      maintainAspectRatio: false
    });
  }, [activeStats, themeColor, stateId]);

  return (
    <div className="super-admin-dashboard">
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/pci-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Reports & Analytics</span>
        <span>/</span>
        <span className="font-semibold text-700">Application Analytics</span>
      </div>

      <div className="fal-page-header">
        <div className="fal-page-header__inner">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div className="fal-page-header__icon-wrap">
              <i className="pi pi-chart-bar" />
            </div>
            <div className="fal-page-header__text">
              <h1 className="fal-page-header__title">Application Analytics Report - {activeStats.stateName}</h1>
              <p className="fal-page-header__subtitle">Visualize nationwide application statistics, service distribution, and processing Turnaround Times (TAT)</p>
            </div>
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
            <Button icon="pi pi-download" label="Export Report" className="p-button-outlined p-button-sm" style={{ borderRadius: '8px' }} />
          </div>
        </div>
      </div>

      <div className="grid gap-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stats-card card-blue p-3">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="text-sm font-semibold text-600 block mb-1">Total Applications</span>
              <h2 className="text-3xl font-bold text-900 m-0">{activeStats.totalApplications}</h2>
              <span className="text-xs text-primary font-medium block mt-2">Cumulative submissions</span>
            </div>
            <div className="card-icon blue">
              <i className="pi pi-file" />
            </div>
          </div>
        </div>

        <div className="stats-card card-green p-3">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="text-sm font-semibold text-600 block mb-1">Approval Rate</span>
              <h2 className="text-3xl font-bold text-900 m-0">{activeStats.approvalRate}</h2>
              <span className="text-xs text-primary font-medium block mt-2">Successfully approved</span>
            </div>
            <div className="card-icon green">
              <i className="pi pi-check-circle" />
            </div>
          </div>
        </div>

        <div className="stats-card card-orange p-3">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="text-sm font-semibold text-600 block mb-1">Average Processing TAT</span>
              <h2 className="text-3xl font-bold text-900 m-0">{activeStats.avgTat}</h2>
              <span className="text-xs text-primary font-medium block mt-2">SLA turnaround time</span>
            </div>
            <div className="card-icon orange">
              <i className="pi pi-clock" />
            </div>
          </div>
        </div>

        <div className="stats-card card-purple p-3">
          <div className="flex justify-content-between align-items-center">
            <div>
              <span className="text-sm font-semibold text-600 block mb-1">Peak Submission Month</span>
              <h2 className="text-3xl font-bold text-900 m-0">{activeStats.peakMonth}</h2>
              <span className="text-xs text-primary font-medium block mt-2">Highest traffic period</span>
            </div>
            <div className="card-icon purple">
              <i className="pi pi-calendar" />
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="grid-col-6">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Volume by Service Type</h3>
            </div>
            <div style={{ height: '300px', position: 'relative' }}>
              {serviceData.labels && <Chart type="bar" data={serviceData} options={serviceOptions} style={{ height: '100%' }} />}
            </div>
          </div>
        </div>

        <div className="grid-col-6">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h3>Processing TAT Trend (Days)</h3>
            </div>
            <div style={{ height: '300px', position: 'relative' }}>
              {tatData.labels && <Chart type="line" data={tatData} options={tatOptions} style={{ height: '100%' }} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationAnalytics;
