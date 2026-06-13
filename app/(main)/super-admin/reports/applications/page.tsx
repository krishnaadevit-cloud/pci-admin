'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Nullable } from 'primereact/ts-helpers';

const ApplicationAnalytics = () => {
  const router = useRouter();
  const [dates, setDates] = useState<Nullable<(Date | null)[]>>([
    new Date(2024, 4, 1),
    new Date(2024, 4, 20)
  ]);

  const [serviceData, setServiceData] = useState<any>({});
  const [serviceOptions, setServiceOptions] = useState<any>({});
  
  const [tatData, setTatData] = useState<any>({});
  const [tatOptions, setTatOptions] = useState<any>({});

  useEffect(() => {
    // Service distribution chart
    setServiceData({
      labels: ['Fresh Registration', 'Renewals', 'Additional Qualification', 'Migration', 'NOC', 'Good Standing'],
      datasets: [
        {
          label: 'Application Count',
          backgroundColor: '#3B82F6',
          data: [65000, 59000, 32000, 21000, 18000, 12000]
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
    setTatData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Average TAT (Days)',
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          data: [15.2, 14.1, 12.8, 11.5, 9.8, 8.4]
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
  }, []);

  return (
    <div className="super-admin-dashboard">
      <div className="text-xs text-500 mb-2 flex align-items-center gap-1">
        <span className="hover:underline cursor-pointer" onClick={() => router.push('/super-admin/dashboard')}>National Dashboard</span>
        <span>/</span>
        <span className="hover:underline cursor-pointer">Reports & Analytics</span>
        <span>/</span>
        <span className="font-semibold text-700">Application Analytics</span>
      </div>

      <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 dashboard-header">
        <div>
          <h2 className="header-title">Application Analytics Report</h2>
          <p className="header-subtitle">Visualize nationwide application statistics, service distribution, and processing Turnaround Times (TAT)</p>
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

      <div className="grid gap-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #3b82f6', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Total Applications</span>
          <span className="text-2xl font-bold text-900 mt-1 block">2,54,120</span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #10b981', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">National Approval Rate</span>
          <span className="text-2xl font-bold text-green-600 mt-1 block">85.4%</span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #f59e0b', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Average Processing TAT</span>
          <span className="text-2xl font-bold text-amber-600 mt-1 block">11.8 Days</span>
        </div>
        <div className="p-3 text-center bg-white" style={{ borderLeft: '4px solid #8b5cf6', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span className="text-xs text-600 font-semibold block">Peak Submission Month</span>
          <span className="text-2xl font-bold text-purple-600 mt-1 block">May 2024</span>
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
