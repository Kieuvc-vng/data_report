import React from 'react';
import { FilterDropdown } from './FilterDropdown';

const TEAMS = ['PEN', 'GDS', 'GIO', 'PRO', 'PIN'];
const LEVELS = ['1.1', '1.2', '1.3', '2.1', '2.2', '2.3'];

interface FilterBarProps {
  selectedTeams: Set<string>;
  selectedLevels: Set<string>;
  onTeamsChange: (teams: Set<string>) => void;
  onLevelsChange: (levels: Set<string>) => void;
}

export const FilterBar = React.memo(function FilterBar({
  selectedTeams,
  selectedLevels,
  onTeamsChange,
  onLevelsChange,
}: FilterBarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FilterDropdown
          label="Team"
          options={TEAMS}
          selectedItems={selectedTeams}
          onSelectionChange={onTeamsChange}
        />

        <FilterDropdown
          label="Level"
          options={LEVELS}
          selectedItems={selectedLevels}
          onSelectionChange={onLevelsChange}
        />
      </div>
    </div>
  );
});
