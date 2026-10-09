import type { Position } from '../types';
import { PositionRow } from './PositionRow';

interface Props {
  deptName: string;
  positions: Position[];
  isOpen: boolean;
  onToggle: () => void;
}

export function DepartmentAccordion({
  deptName,
  positions,
  isOpen,
  onToggle,
}: Props) {
  return (
    <div className="mb-2 border-l-4 border-blue-400">
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-2 hover:bg-blue-50 font-semibold text-blue-900 flex items-center gap-2 transition"
      >
        <span className="text-sm">{isOpen ? '▼' : '▶'}</span>
        <span>{deptName} ({positions.length})</span>
      </button>

      {isOpen && (
        <div className="bg-white">
          {/* Header Row - Hide on mobile, show on md and up */}
          <div className="hidden md:grid grid-cols-6 gap-4 py-3 px-4 bg-gray-50 font-semibold text-xs text-gray-600 uppercase border-b border-gray-200 items-start">
            <div>Job Code</div>
            <div>Position</div>
            <div>Manager</div>
            <div className="text-center">HC</div>
            <div>Priority</div>
            <div className="text-right">Pipeline</div>
          </div>

          {/* Position Rows */}
          {positions.map((position) => (
            <PositionRow key={position.id} position={position} />
          ))}
        </div>
      )}
    </div>
  );
}
