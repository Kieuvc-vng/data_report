import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { CurrentOpeningsTab } from './components/CurrentOpeningsTab';
import { HistoricalTabQueryForm } from './components/HistoricalTabQueryForm';
import { HistoricalAnalyticsPage } from './components/HistoricalAnalyticsPage';
import { useAuthStore } from './stores/authStore';
import { useHiringStore } from './stores/hiringStore';
import { mockPositions, mockCandidates, getHiringSummaryByDateRange } from './data/mockData';
import type { HiringSummary } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('current');
  const [activeTeam, setActiveTeam] = useState('All Teams');
  const [historicalQuery, setHistoricalQuery] = useState<{
    startDate: string;
    endDate: string;
    team?: string;
    position?: string;
  } | null>(null);
  const [showAnalyticsPage, setShowAnalyticsPage] = useState(false);
  const [hiringSummary, setHiringSummary] = useState<HiringSummary | null>(null);

  console.log('🔍 App rendering - showAnalyticsPage:', showAnalyticsPage, 'has summary:', !!hiringSummary);

  // Initialize stores with mock data
  const hiringStore = useHiringStore();
  const authStore = useAuthStore();
  const positions = hiringStore.positions;

  // Set mock data on mount (in Phase 2, this will be from API)
  useEffect(() => {
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
    console.log('🔍 handleHistoricalQuery called');
    setHistoricalQuery(params);
    const summary = getHiringSummaryByDateRange(
      params.startDate,
      params.endDate,
      params.team
    );
    console.log('🔍 Setting showAnalyticsPage to true, summary:', summary);
    setHiringSummary(summary);
    setShowAnalyticsPage(true);
  };

  const tabLabels = [
    {
      id: 'current',
      label: 'Current Opening Positions',
    },
    {
      id: 'historical',
      label: 'Historical Data',
    },
  ];

  // Show analytics page when query is submitted
  if (showAnalyticsPage && hiringSummary) {
    return (
      <HistoricalAnalyticsPage
        summary={hiringSummary}
        query={historicalQuery}
        tabs={tabLabels}
        activeTab="historical"
        onBack={() => {
          setShowAnalyticsPage(false);
          setHistoricalQuery(null);
          setHiringSummary(null);
        }}
      />
    );
  }

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
        <HistoricalTabQueryForm onSubmit={handleHistoricalQuery} />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
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
