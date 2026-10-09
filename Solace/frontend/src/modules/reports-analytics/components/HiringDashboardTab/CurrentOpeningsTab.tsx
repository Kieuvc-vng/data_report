import React, { useState } from 'react'
import { useQuery } from '../../hooks/useQuery'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import {
  getHiringPositions,
  getHiringMetrics,
  getBusinessUnits,
} from '../../api'
import { AccordionSkeleton, MetricsSkeleton } from './LoadingState'
import { PositionAccordion } from './PositionAccordion'

export const CurrentOpeningsTab: React.FC = () => {
  const [businessUnit, setBusinessUnit] = useState('')
  const { handleError } = useErrorHandler()

  // Fetch business units for dropdown
  const {
    data: businessUnits = [],
    isLoading: businessUnitsLoading,
  } = useQuery('businessUnits', () => getBusinessUnits(), {
    cacheKey: 'businessUnits',
  })

  // Fetch positions
  const {
    data: positions,
    isLoading: positionsLoading,
    error: positionsError,
    refetch: refetchPositions,
  } = useQuery(
    `positions:${businessUnit}`,
    () => getHiringPositions({ businessUnit: businessUnit || undefined }),
    {
      cacheKey: `positions:${businessUnit}`,
    },
  )

  // Fetch metrics
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery(
    'metrics:current',
    () => getHiringMetrics({ businessUnit: businessUnit || undefined }),
    {
      cacheKey: 'metrics:current',
    },
  )

  if (positionsError) {
    const { title, message, action } = handleError(positionsError)
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="font-semibold text-red-900 dark:text-red-100">{title}</h3>
        <p className="text-sm text-red-700 dark:text-red-200">{message}</p>
        {action && (
          <button
            onClick={action}
            className="mt-2 px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded text-sm hover:bg-red-700 dark:hover:bg-red-600"
          >
            Retry
          </button>
        )}
      </div>
    )
  }

  if (metricsError) {
    const { title, message } = handleError(metricsError)
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="font-semibold text-red-900 dark:text-red-100">{title}</h3>
        <p className="text-sm text-red-700 dark:text-red-200">{message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Business Unit Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="businessUnit" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Business Unit:
        </label>
        <select
          id="businessUnit"
          value={businessUnit}
          onChange={(e) => setBusinessUnit(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Business Units</option>
          {businessUnitsLoading ? (
            <option disabled>Loading...</option>
          ) : (
            businessUnits.map((bu) => (
              <option key={bu} value={bu}>
                {bu}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Metrics Section */}
      {metricsLoading ? (
        <MetricsSkeleton />
      ) : (
        metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Hired</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.totalHired || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Total HC</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.hcTotal || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Time to Fill (days)</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.timeToFill || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">Offers Count</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.offersCount || 0}
              </div>
            </div>
          </div>
        )
      )}

      {/* Positions Accordion */}
      {positionsLoading ? (
        <AccordionSkeleton />
      ) : positions && positions.length > 0 ? (
        <div className="space-y-4">
          {positions.map((position) => (
            <PositionAccordion key={position.id} position={position} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">No positions found</p>
      )}

      {/* Refresh Button */}
      <button
        onClick={async () => {
          await refetchPositions()
          await refetchMetrics()
        }}
        className="mt-6 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
      >
        Refresh Data
      </button>
    </div>
  )
}

export default CurrentOpeningsTab
