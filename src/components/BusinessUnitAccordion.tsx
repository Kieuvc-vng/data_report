import type { Position } from '../types';
import { DepartmentAccordion } from './DepartmentAccordion';

interface Props {
  buLabel: string;
  departments: readonly string[];
  positions: Position[];
  isOpen: boolean;
  onToggle: () => void;
  expandedDepts: Set<string>;
  onDeptToggle: (dept: string) => void;
}

export function BusinessUnitAccordion({
  buLabel,
  departments,
  positions,
  isOpen,
  onToggle,
  expandedDepts,
  onDeptToggle,
}: Props) {
  const deptCount = positions.length;

  return (
    <div className="bu-section mb-3 border border-gray-300 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 bg-slate-200 hover:bg-slate-300 font-bold flex items-center gap-2 transition"
      >
        <span className="text-lg">{isOpen ? '▼' : '▶'}</span>
        <span>{buLabel}</span>
        <span className="text-gray-600 text-sm">({deptCount} positions)</span>
      </button>

      {isOpen && (
        <div className="pl-4 py-2 bg-slate-50">
          {/* Group positions by department */}
          {departments.map((dept) => {
            const deptPositions = positions.filter((p) => p.department === dept);

            if (deptPositions.length === 0) return null;

            return (
              <DepartmentAccordion
                key={dept}
                deptName={dept}
                positions={deptPositions}
                isOpen={expandedDepts.has(dept)}
                onToggle={() => onDeptToggle(dept)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
