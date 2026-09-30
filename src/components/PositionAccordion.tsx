import { useState } from 'react';
import type { Position } from '../types';
import { PositionRow } from './PositionRow';
import clsx from 'clsx';

interface PositionAccordionProps {
  positions: Position[];
}

const TEAMS_ORDER = ['PEN', 'GDS', 'GIO', 'PRO', 'PIN'];

export function PositionAccordion({ positions }: PositionAccordionProps) {
  const [expandedTeam, setExpandedTeam] = useState<string>('PEN');

  // Group positions by team
  const positionsByTeam = TEAMS_ORDER.reduce(
    (acc, team) => {
      acc[team] = positions.filter((p) => p.team === team);
      return acc;
    },
    {} as Record<string, Position[]>
  );

  return (
    <div className="space-y-2">
      {TEAMS_ORDER.map((team) => {
        const teamPositions = positionsByTeam[team];
        const isExpanded = expandedTeam === team;
        const positionCount = teamPositions.length;

        return (
          <div key={team} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* Accordion Header */}
            <button
              onClick={() => setExpandedTeam(isExpanded ? '' : team)}
              className={clsx(
                'w-full px-6 py-4 flex justify-between items-center font-semibold text-left transition-colors',
                isExpanded ? 'bg-blue-50 border-b border-gray-200' : 'hover:bg-gray-50'
              )}
            >
              <span>
                {isExpanded ? '▼' : '▶'} {team} — {positionCount} position{positionCount !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-500 text-sm">{positionCount} open</span>
            </button>

            {/* Accordion Content */}
            {isExpanded && (
              <div>
                {/* Header Row - Hide on mobile, show on md and up */}
                <div className="hidden md:grid grid-cols-5 gap-4 py-3 px-4 bg-gray-50 font-semibold text-xs text-gray-600 uppercase border-b border-gray-200">
                  <div>Position</div>
                  <div className="text-center">HC</div>
                  <div>Salary</div>
                  <div>Priority</div>
                  <div className="text-right">Pipeline</div>
                </div>

                {/* Position Rows */}
                {teamPositions.map((position) => (
                  <PositionRow key={position.id} position={position} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
