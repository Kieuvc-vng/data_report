import React from 'react';
import { Header } from './components/Header';
import { useAuthStore } from './stores/authStore';
import { useHiringStore } from './stores/hiringStore';
import { mockPositions, mockCandidates } from './data/mockData';

function App() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Placeholder for tab navigation and content */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4">Hiring Dashboard</h2>
          <p className="text-gray-600">Tab navigation and content coming in Task 6+</p>
        </div>
      </main>
    </div>
  );
}

export default App;
