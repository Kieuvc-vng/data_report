import { useMemo, useState } from 'react';
import type { Position } from '../types';
import { FilterBar } from './FilterBar';
import { SummaryCards } from './SummaryCards';
import { PositionAccordion } from './PositionAccordion';
import { useSummaryMetrics } from '../hooks/useSummaryMetrics';

interface CurrentOpeningsTabProps {
  positions: Position[];
}

export function CurrentOpeningsTab({
  positions,
}: CurrentOpeningsTabProps) {
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set(['PEN', 'GDS', 'GIO', 'PRO', 'PIN']));
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(['1.1', '1.2', '1.3', '2.1', '2.2', '2.3']));
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set(['P1', 'P2', 'P3']));

  // Filter positions using AND logic for all three filters
  const filteredPositions = useMemo(() => {
    return positions.filter((p) => {
      const teamMatch = selectedTeams.size === 0 || selectedTeams.has(p.team);
      const levelMatch = selectedLevels.size === 0 || selectedLevels.has(p.level);
      const priorityMatch = selectedPriorities.size === 0 || selectedPriorities.has(p.priority);
      return teamMatch && levelMatch && priorityMatch;
    });
  }, [positions, selectedTeams, selectedLevels, selectedPriorities]);

  // Calculate metrics for filtered positions
  const metrics = useSummaryMetrics(filteredPositions);

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <FilterBar
        selectedTeams={selectedTeams}
        selectedLevels={selectedLevels}
        selectedPriorities={selectedPriorities}
        onTeamsChange={setSelectedTeams}
        onLevelsChange={setSelectedLevels}
        onPrioritiesChange={setSelectedPriorities}
      />

      {/* Summary Cards */}
      <SummaryCards {...metrics} />

      {/* Positions Section Title */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Positions by Team ({filteredPositions.length} positions)
        </h3>

        {/* Position Accordion */}
        {filteredPositions.length > 0 ? (
          <PositionAccordion positions={filteredPositions} />
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">No positions found with selected filters</p>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <button className="px-4 py-3 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium min-h-[44px] sm:min-h-fit">
          📥 Export CSV
        </button>
        <button className="px-4 py-3 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium min-h-[44px] sm:min-h-fit">
          📄 Export PDF
        </button>
      </div>
    </div>
  );
}
