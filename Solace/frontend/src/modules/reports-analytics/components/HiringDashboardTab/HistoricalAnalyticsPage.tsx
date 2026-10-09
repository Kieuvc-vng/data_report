import React, { useState } from 'react'
import { useQuery } from '../../hooks/useQuery'
import { useErrorHandler } from '../../hooks/useErrorHandler'
import { getHistoricalData } from '../../api'
import { ChartSkeleton } from './LoadingState'

export const HistoricalAnalyticsPage: React.FC = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  })
  const { handleError } = useErrorHandler()

  const {
    data: historicalData,
    isLoading,
    error,
  } = useQuery(
    `historical:${filters.startDate}:${filters.endDate}`,
    () => getHistoricalData(filters),
    {
      cacheKey: `historical:${filters.startDate}:${filters.endDate}`,
      enabled: !!filters.startDate && !!filters.endDate,
    },
  )

  if (error) {
    const { title, message } = handleError(error)
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="font-semibold text-red-900 dark:text-red-100">{title}</h3>
        <p className="text-sm text-red-700 dark:text-red-200">{message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex gap-4 items-center">
        <label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Start Date:
        </label>
        <input
          id="startDate"
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
        />
        <label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          End Date:
        </label>
        <input
          id="endDate"
          type="date"
          value={filters.endDate}
          onChange={(e) =>
            setFilters({ ...filters, endDate: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Data Display */}
      {isLoading ? (
        <ChartSkeleton />
      ) : historicalData ? (
        <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Historical Data
          </h3>
          <div className="overflow-auto">
            <pre className="text-sm text-gray-600 dark:text-gray-400">
              {JSON.stringify(historicalData, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          Select date range to view data
        </p>
      )}
    </div>
  )
}

export default HistoricalAnalyticsPage
