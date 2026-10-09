import { useState } from 'react'
import type { Position } from '../../types'

interface PositionAccordionProps {
  position: Position
}

export function PositionAccordion({ position }: PositionAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex justify-between items-center font-semibold text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span className="flex items-center gap-3">
          <span className="text-gray-600 dark:text-gray-400">{isExpanded ? '▼' : '▶'}</span>
          <span className="text-gray-900 dark:text-white">{position.title}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">({position.jobCode || position.id})</span>
        </span>
        <span className={`text-xs px-2 py-1 rounded ${
          position.status === 'open'
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
            : position.status === 'filled'
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
        }`}>
          {position.status}
        </span>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Department</div>
              <div className="font-semibold text-gray-900 dark:text-white">{position.department}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Business Unit</div>
              <div className="font-semibold text-gray-900 dark:text-white">{position.businessUnit}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Level</div>
              <div className="font-semibold text-gray-900 dark:text-white">{position.level}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Salary</div>
              <div className="font-semibold text-gray-900 dark:text-white">{position.salary}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">HC</div>
              <div className="font-semibold text-gray-900 dark:text-white">{position.hc}</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Priority</div>
              <div className="font-semibold text-gray-900 dark:text-white">{position.priority}</div>
            </div>
            {position.lineManager && (
              <div className="col-span-2">
                <div className="text-gray-600 dark:text-gray-400">Line Manager</div>
                <div className="font-semibold text-gray-900 dark:text-white">{position.lineManager.name} ({position.lineManager.email})</div>
              </div>
            )}
            <div className="col-span-2">
              <div className="text-gray-600 dark:text-gray-400">Pipeline</div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-gray-600 dark:text-gray-400 text-xs">CV</div>
                  <div className="font-bold text-gray-900 dark:text-white">{position.pipeline.cv}</div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-gray-600 dark:text-gray-400 text-xs">1st Interview</div>
                  <div className="font-bold text-gray-900 dark:text-white">{position.pipeline.firstInterview}</div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-gray-600 dark:text-gray-400 text-xs">2nd Interview</div>
                  <div className="font-bold text-gray-900 dark:text-white">{position.pipeline.secondInterview}</div>
                </div>
                <div className="text-center p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <div className="text-gray-600 dark:text-gray-400 text-xs">Offers</div>
                  <div className="font-bold text-gray-900 dark:text-white">{position.pipeline.offers}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
