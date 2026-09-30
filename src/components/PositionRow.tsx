import type { Position } from '../types';
import { Badge } from './Badge';

interface PositionRowProps {
  position: Position;
}

export function PositionRow({ position }: PositionRowProps) {
  return (
    <>
      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-3 py-4 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        <div>
          <p className="font-semibold text-gray-900 text-base">{position.title}</p>
          <p className="text-sm text-gray-500">{position.level}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 font-medium">HC</p>
            <p className="text-sm font-semibold text-gray-900">{position.hc}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">SALARY</p>
            <p className="text-sm font-semibold text-gray-900">{position.salary}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 font-medium">PRIORITY</p>
            <Badge variant={position.priority === 'P1' ? 'p1' : position.priority === 'P2' ? 'p2' : 'p3'}>
              {position.priority}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">PIPELINE</p>
            <p className="text-xs font-semibold text-gray-900">
              {position.pipeline.cv}→{position.pipeline.firstInterview}→{position.pipeline.secondInterview}→{position.pipeline.offers}
            </p>
            <p className="text-xs text-gray-400">CV→1st→2nd→Offer</p>
          </div>
        </div>
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:grid grid-cols-5 gap-4 py-4 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
        {/* Position Title & Level */}
        <div>
          <p className="font-semibold text-gray-900">{position.title}</p>
          <p className="text-sm text-gray-500">{position.level}</p>
        </div>

        {/* HC Count */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{position.hc}</p>
          <p className="text-xs text-gray-500">HC</p>
        </div>

        {/* Salary */}
        <div>
          <p className="text-sm font-semibold text-gray-900">{position.salary}</p>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center">
          <Badge variant={position.priority === 'P1' ? 'p1' : position.priority === 'P2' ? 'p2' : 'p3'}>
            {position.priority}
          </Badge>
        </div>

        {/* Pipeline */}
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">
            {position.pipeline.cv} → {position.pipeline.firstInterview} → {position.pipeline.secondInterview} → {position.pipeline.offers}
          </p>
          <p className="text-xs text-gray-500">CV → 1st → 2nd → Offer</p>
        </div>
      </div>
    </>
  );
}
