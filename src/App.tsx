import React, { useState } from 'react';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { useAuthStore } from './stores/authStore';
import { useHiringStore } from './stores/hiringStore';
import { mockPositions, mockCandidates } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('current');

  // Initialize stores with mock data
  const hiringStore = useHiringStore();
  const authStore = useAuthStore();

  // Set mock data on mount (in Phase 2, this will be from API)
  React.useEffect(() => {
    hiringStore.setPositions(mockPositions);
    hiringStore.setCandidates(mockCandidates);
    // Default: Head of TA with all teams access
    authStore.setUser('head_of_ta');
  }, []);

  const tabs = [
    {
      id: 'current',
      label: 'Current Opening Positions',
      content: (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4">Current Opening Positions</h2>
          <p className="text-gray-600">Content coming in Task 10+</p>
        </div>
      ),
    },
    {
      id: 'historical',
      label: 'Historical Data',
      content: (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4">Historical Data</h2>
          <p className="text-gray-600">Content coming in Task 12+</p>
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
