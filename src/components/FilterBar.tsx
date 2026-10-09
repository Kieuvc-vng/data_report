import React from 'react';
import { FilterDropdown } from './FilterDropdown';
import { BUSINESS_UNITS } from '../constants/businessUnits';

const LEVELS = ['1.1', '1.2', '1.3', '2.1', '2.2', '2.3'];
const PRIORITIES = ['P1', 'P2', 'P3'];

interface FilterBarProps {
  selectedBU: string | null;
  selectedDept: string | null;
  selectedLevels: Set<string>;
  selectedPriorities: Set<string>;
  onBUChange: (bu: string | null) => void;
  onDeptChange: (dept: string | null) => void;
  onLevelsChange: (levels: Set<string>) => void;
  onPrioritiesChange: (priorities: Set<string>) => void;
  availableDepts: readonly string[];
}

export const FilterBar = React.memo(function FilterBar({
  selectedBU,
  selectedDept,
  selectedLevels,
  selectedPriorities,
  onBUChange,
  onDeptChange,
  onLevelsChange,
  onPrioritiesChange,
  availableDepts,
}: FilterBarProps) {
  const buOptions = [
    { label: 'All', value: null },
    ...BUSINESS_UNITS.map((bu) => ({
      label: bu.label,
      value: bu.code,
    })),
  ];

  const deptOptions = [
    { label: 'All', value: null },
    ...availableDepts.map((dept) => ({
      label: dept,
      value: dept,
    })),
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-600 uppercase mb-4 tracking-wide">
        Filters
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Business Unit Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">BUSINESS UNIT</label>
          <select
            value={selectedBU || ''}
            onChange={(e) => onBUChange(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {buOptions.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value || ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Department Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">DEPARTMENT</label>
          <select
            value={selectedDept || ''}
            onChange={(e) => onDeptChange(e.target.value || null)}
            disabled={availableDepts.length === 0}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
          >
            {deptOptions.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value || ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter (keep existing Set-based) */}
        <FilterDropdown
          label="Level"
          options={LEVELS}
          selectedItems={selectedLevels}
          onSelectionChange={onLevelsChange}
        />

        {/* Priority Filter (keep existing Set-based) */}
        <FilterDropdown
          label="Priority"
          options={PRIORITIES}
          selectedItems={selectedPriorities}
          onSelectionChange={onPrioritiesChange}
        />
      </div>
    </div>
  );
});
