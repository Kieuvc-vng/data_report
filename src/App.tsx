import React, { useState } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { CurrentOpeningsTab } from './components/CurrentOpeningsTab';
import { HistoricalTabQueryForm } from './components/HistoricalTabQueryForm';
import { useAuthStore } from './stores/authStore';
import { useHiringStore } from './stores/hiringStore';
import { mockPositions, mockCandidates } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('current');
  const [activeTeam, setActiveTeam] = useState('All Teams');
  const [historicalQuery, setHistoricalQuery] = useState<{
    startDate: string;
    endDate: string;
    team?: string;
    position?: string;
  } | null>(null);

  // Initialize stores with mock data
  const hiringStore = useHiringStore();
  const authStore = useAuthStore();
  const positions = hiringStore.positions;

  // Set mock data on mount (in Phase 2, this will be from API)
  React.useEffect(() => {
    hiringStore.setPositions(mockPositions);
    hiringStore.setCandidates(mockCandidates);
    // Default: Head of TA with all teams access
    authStore.setUser('head_of_ta');
  }, []);

  const handleHistoricalQuery = (params: {
    startDate: string;
    endDate: string;
    team?: string;
    position?: string;
  }) => {
    setHistoricalQuery(params);
  };

  const tabs = [
    {
      id: 'current',
      label: 'Current Opening Positions',
      content: (
        <CurrentOpeningsTab
          positions={positions}
          activeTeam={activeTeam}
          onTeamChange={setActiveTeam}
        />
      ),
    },
    {
      id: 'historical',
      label: 'Historical Data',
      content: (
        <div className="space-y-8">
          <HistoricalTabQueryForm onSubmit={handleHistoricalQuery} />
          {historicalQuery && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Query Results</h3>
              <div className="space-y-2 text-gray-600">
                <p>
                  <strong>Date Range:</strong> {historicalQuery.startDate} to{' '}
                  {historicalQuery.endDate}
                </p>
                {historicalQuery.team && (
                  <p>
                    <strong>Team:</strong> {historicalQuery.team}
                  </p>
                )}
                {historicalQuery.position && (
                  <p>
                    <strong>Position:</strong> {historicalQuery.position}
                  </p>
                )}
              </div>
              <p className="text-gray-500 mt-4 text-sm">
                Charts and detailed data will be displayed here (Task 13+)
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </main>
    </div>
  );
}

export default App;
