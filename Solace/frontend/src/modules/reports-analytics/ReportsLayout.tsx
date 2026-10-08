import React, { useState } from 'react';
import HiringDashboardPage from './pages/HiringDashboardPage';

type ReportTab = 'hiring';

interface ReportTabConfig {
  id: ReportTab;
  label: string;
  component: React.ComponentType;
}

const reportTabs: ReportTabConfig[] = [
  {
    id: 'hiring',
    label: 'Hiring Dashboard',
    component: HiringDashboardPage,
  },
];

export const ReportsLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('hiring');

  const activeTabConfig = reportTabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return (
    <div className="w-full">
      {/* Report Tabs Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {reportTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default ReportsLayout;
