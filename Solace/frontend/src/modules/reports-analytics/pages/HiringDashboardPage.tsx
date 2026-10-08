import React, { useState } from 'react';
import {
  CurrentOpeningsTab,
  HistoricalAnalyticsPage,
} from '../components/HiringDashboardTab';

type Tab = 'current' | 'historical';

export const HiringDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('current');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'current'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Current Opening Positions
        </button>
        <button
          onClick={() => setActiveTab('historical')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'historical'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Historical Data
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'current' && <CurrentOpeningsTab />}
        {activeTab === 'historical' && <HistoricalAnalyticsPage />}
      </div>
    </div>
  );
};

export default HiringDashboardPage;
