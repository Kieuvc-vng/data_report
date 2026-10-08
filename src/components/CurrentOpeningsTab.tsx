import { useMemo, useState } from 'react';
import type { Position } from '../types';
import { FilterBar } from './FilterBar';
import { SummaryCards } from './SummaryCards';
import { BusinessUnitAccordion } from './BusinessUnitAccordion';
import { useSummaryMetrics } from '../hooks/useSummaryMetrics';
import { BUSINESS_UNITS } from '../constants/businessUnits';

interface CurrentOpeningsTabProps {
  positions: Position[];
}

export function CurrentOpeningsTab({
  positions,
}: CurrentOpeningsTabProps) {
  const [selectedBU, setSelectedBU] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<Set<string>>(new Set(['1.1', '1.2', '1.3', '2.1', '2.2', '2.3']));
  const [selectedPriorities, setSelectedPriorities] = useState<Set<string>>(new Set(['P1', 'P2', 'P3']));
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  // Get available departments for selected BU
  const selectedBUData = BUSINESS_UNITS.find((bu) => bu.code === selectedBU);
  const availableDepts = selectedBUData?.departments || [];

  // Filter positions using AND logic
  const filteredPositions = useMemo(() => {
    return positions.filter((p) => {
      const buMatch = !selectedBU || p.businessUnit === selectedBU;
      const deptMatch = !selectedDept || p.department === selectedDept;
      const levelMatch = selectedLevels.size === 0 || selectedLevels.has(p.level);
      const priorityMatch = selectedPriorities.size === 0 || selectedPriorities.has(p.priority);
      return buMatch && deptMatch && levelMatch && priorityMatch;
    });
  }, [positions, selectedBU, selectedDept, selectedLevels, selectedPriorities]);

  // Calculate metrics for filtered positions
  const metrics = useSummaryMetrics(filteredPositions);

  const handleBUChange = (buCode: string | null) => {
    setSelectedBU(buCode);
    setSelectedDept(null); // reset department filter
  };

  const handleDeptToggle = (dept: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      if (next.has(dept)) {
        next.delete(dept);
      } else {
        next.add(dept);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <FilterBar
        selectedBU={selectedBU}
        selectedDept={selectedDept}
        selectedLevels={selectedLevels}
        selectedPriorities={selectedPriorities}
        onBUChange={handleBUChange}
        onDeptChange={setSelectedDept}
        onLevelsChange={setSelectedLevels}
        onPrioritiesChange={setSelectedPriorities}
        availableDepts={availableDepts}
      />

      {/* Summary Cards */}
      <SummaryCards {...metrics} />

      {/* Positions Section Title */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Positions by Business Unit ({filteredPositions.length} positions)
        </h3>

        {/* Business Units */}
        {filteredPositions.length > 0 ? (
          <div className="space-y-3">
            {BUSINESS_UNITS.map((bu) => {
              const buPositions = filteredPositions.filter(
                (p) => p.businessUnit === bu.code
              );

              // Skip BU if no positions (after filtering)
              if (buPositions.length === 0 && selectedBU !== bu.code) {
                return null;
              }

              return (
                <BusinessUnitAccordion
                  key={bu.code}
                  buLabel={bu.label}
                  departments={bu.departments}
                  positions={buPositions}
                  isOpen={selectedBU === bu.code || !selectedBU}
                  onToggle={() =>
                    handleBUChange(selectedBU === bu.code ? null : bu.code)
                  }
                  expandedDepts={expandedDepts}
                  onDeptToggle={handleDeptToggle}
                />
              );
            })}
          </div>
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
