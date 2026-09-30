import { useMemo } from 'react';
import type { Position } from '../types';
import { TeamFilter } from './TeamFilter';
import { SummaryCards } from './SummaryCards';
import { PositionAccordion } from './PositionAccordion';
import { useSummaryMetrics } from '../hooks/useSummaryMetrics';

interface CurrentOpeningsTabProps {
  positions: Position[];
  activeTeam: string;
  onTeamChange: (team: string) => void;
}

export function CurrentOpeningsTab({
  positions,
  activeTeam,
  onTeamChange,
}: CurrentOpeningsTabProps) {
  // Filter positions by team
  const filteredPositions = useMemo(() => {
    return activeTeam === 'All Teams'
      ? positions
      : positions.filter((p) => p.team === activeTeam);
  }, [positions, activeTeam]);

  // Calculate metrics for filtered positions
  const metrics = useSummaryMetrics(positions, activeTeam === 'All Teams' ? undefined : activeTeam);

  return (
    <div className="space-y-8">
      {/* Team Filter */}
      <TeamFilter activeTeam={activeTeam} onTeamChange={onTeamChange} />

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
            <p className="text-gray-500">No positions found for {activeTeam}</p>
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
