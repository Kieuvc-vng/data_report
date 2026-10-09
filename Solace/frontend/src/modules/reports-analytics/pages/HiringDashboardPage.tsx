import React, { useState } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import {
  CurrentOpeningsTab,
  HistoricalAnalyticsPage,
} from '../components/HiringDashboardTab'

type Tab = 'current' | 'historical'

export const HiringDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('current')

  return (
    <ErrorBoundary>
      <div className="w-full">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'current'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Current Opening Positions
          </button>
          <button
            onClick={() => setActiveTab('historical')}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'historical'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
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
    </ErrorBoundary>
  )
}

export default HiringDashboardPage
