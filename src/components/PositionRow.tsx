import { useNavigate } from 'react-router-dom';
import type { Position } from '../types';
import { Badge } from './Badge';

interface PositionRowProps {
  position: Position;
}

export function PositionRow({ position }: PositionRowProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (position.jobCode) {
      navigate(`/positions/${position.jobCode}`);
    }
  };

  return (
    <>
      {/* Mobile View - Card Layout */}
      <div
        onClick={handleClick}
        className="md:hidden space-y-3 py-4 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-900 text-base">{position.title}</p>
              <p className="text-sm text-gray-500">{position.level}</p>
            </div>
            <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">{position.jobCode}</p>
          </div>
          {position.lineManager && (
            <>
              <p className="text-xs text-gray-600 mt-2">
                <span className="font-medium">Manager:</span> {position.lineManager.name}
              </p>
              <p className="text-xs text-gray-500">{position.lineManager.email}</p>
            </>
          )}
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
      <div
        onClick={handleClick}
        className="hidden md:grid grid-cols-6 gap-4 py-4 px-4 border-b border-gray-200 hover:bg-gray-50 transition-colors items-start cursor-pointer"
      >
        {/* Job Code */}
        <div className="min-w-fit">
          <p className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono font-semibold whitespace-nowrap">
            {position.jobCode || 'N/A'}
          </p>
        </div>

        {/* Position Title & Level */}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900">{position.title}</p>
          <p className="text-xs text-gray-500">{position.level}</p>
        </div>

        {/* Line Manager */}
        <div className="min-w-0">
          {position.lineManager ? (
            <>
              <p className="text-sm font-semibold text-gray-900">{position.lineManager.name}</p>
              <p className="text-xs text-gray-500 truncate">{position.lineManager.email}</p>
            </>
          ) : (
            <p className="text-xs text-gray-500">-</p>
          )}
        </div>

        {/* HC Count */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">{position.hc}</p>
          <p className="text-xs text-gray-500">HC</p>
        </div>

        {/* Priority Badge */}
        <div className="flex items-start">
          <Badge variant={position.priority === 'P1' ? 'p1' : position.priority === 'P2' ? 'p2' : 'p3'}>
            {position.priority}
          </Badge>
        </div>

        {/* Pipeline */}
        <div className="text-right min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {position.pipeline.cv} → {position.pipeline.firstInterview} → {position.pipeline.secondInterview} → {position.pipeline.offers}
          </p>
          <p className="text-xs text-gray-500">CV → 1st → 2nd → Offer</p>
        </div>
      </div>
    </>
  );
}
